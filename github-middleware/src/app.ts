import Fastify from "fastify";
import { timingSafeEqual } from "node:crypto";
import { AppConfig } from "./config";
import { HttpError } from "./lib/http";
import { GitHubClient, GitHubRequestError } from "./lib/github";
import { healthRoutes } from "./routes/health";
import { repoRoutes } from "./routes/repo";
import { branchRoutes } from "./routes/branch";
import { filesRoutes } from "./routes/files";
import { pullRequestRoutes } from "./routes/pr";
import { buildRoutes } from "./routes/build";
import { artifactsRoutes } from "./routes/artifacts";

function buildLoggerConfig(nodeEnv: string) {
  if (nodeEnv === "development") {
    return {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname"
        }
      }
    };
  }

  return {
    level: "info"
  };
}

function tokenMatches(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: buildLoggerConfig(config.nodeEnv),
    ajv: {
      customOptions: {
        allErrors: true,
        coerceTypes: true,
        useDefaults: true
      }
    }
  });

  const github = new GitHubClient(config);

  app.setErrorHandler((error, request, reply) => {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const statusCode =
      error instanceof HttpError || error instanceof GitHubRequestError
        ? error.statusCode
        : typeof (error as { statusCode?: number }).statusCode === "number"
          ? (error as { statusCode: number }).statusCode
          : 500;

    const details =
      error instanceof HttpError || error instanceof GitHubRequestError
        ? error.details
        : (error as { validation?: unknown }).validation;

    if (statusCode >= 500) {
      request.log.error({ err: error }, "request failed");
    } else {
      request.log.warn({ err: error }, "request failed");
    }

    reply.code(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : message,
      ...(details ? { details } : {})
    });
  });

  app.setNotFoundHandler(async (_, reply) => {
    reply.code(404).send({
      error: "Route not found"
    });
  });

  app.register(healthRoutes);

  app.register(async (protectedApp) => {
    protectedApp.addHook("onRequest", async (request) => {
      const expected = config.apiBearerToken;
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        throw new HttpError(401, "Missing bearer token");
      }

      const token = authorization.slice("Bearer ".length).trim();
      if (!tokenMatches(expected, token)) {
        throw new HttpError(401, "Invalid bearer token");
      }
    });

    protectedApp.register(repoRoutes, { github, config });
    protectedApp.register(branchRoutes, { github, config });
    protectedApp.register(filesRoutes, { github, config });
    protectedApp.register(pullRequestRoutes, { github, config });
    protectedApp.register(buildRoutes);
    protectedApp.register(artifactsRoutes);
  });

  return app;
}
