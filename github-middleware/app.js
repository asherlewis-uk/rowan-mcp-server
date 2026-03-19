"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const node_crypto_1 = require("node:crypto");
const http_1 = require("./lib/http");
const github_1 = require("./lib/github");
const health_1 = require("./routes/health");
const repo_1 = require("./routes/repo");
const branch_1 = require("./routes/branch");
const files_1 = require("./routes/files");
const pr_1 = require("./routes/pr");
const build_1 = require("./routes/build");
const artifacts_1 = require("./routes/artifacts");
function buildLoggerConfig(nodeEnv) {
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
function tokenMatches(expected, actual) {
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(expectedBuffer, actualBuffer);
}
function buildApp(config) {
    const app = (0, fastify_1.default)({
        logger: buildLoggerConfig(config.nodeEnv),
        ajv: {
            customOptions: {
                allErrors: true,
                coerceTypes: true,
                useDefaults: true
            }
        }
    });
    const github = new github_1.GitHubClient(config);
    app.setErrorHandler((error, request, reply) => {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const statusCode = error instanceof http_1.HttpError || error instanceof github_1.GitHubRequestError
            ? error.statusCode
            : typeof error.statusCode === "number"
                ? error.statusCode
                : 500;
        const details = error instanceof http_1.HttpError || error instanceof github_1.GitHubRequestError
            ? error.details
            : error.validation;
        if (statusCode >= 500) {
            request.log.error({ err: error }, "request failed");
        }
        else {
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
    app.register(health_1.healthRoutes);
    app.register(async (protectedApp) => {
        protectedApp.addHook("onRequest", async (request) => {
            const expected = config.apiBearerToken;
            const authorization = request.headers.authorization;
            if (!authorization?.startsWith("Bearer ")) {
                throw new http_1.HttpError(401, "Missing bearer token");
            }
            const token = authorization.slice("Bearer ".length).trim();
            if (!tokenMatches(expected, token)) {
                throw new http_1.HttpError(401, "Invalid bearer token");
            }
        });
        protectedApp.register(repo_1.repoRoutes, { github, config });
        protectedApp.register(branch_1.branchRoutes, { github, config });
        protectedApp.register(files_1.filesRoutes, { github, config });
        protectedApp.register(pr_1.pullRequestRoutes, { github, config });
        protectedApp.register(build_1.buildRoutes);
        protectedApp.register(artifacts_1.artifactsRoutes);
    });
    return app;
}
