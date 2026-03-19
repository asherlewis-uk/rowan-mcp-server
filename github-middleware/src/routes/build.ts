import { spawn } from "node:child_process";
import path from "node:path";
import { FastifyPluginAsync } from "fastify";
import { HttpError } from "../lib/http";

interface BuildRequestBody {
  name: string;
}

const buildRequestBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1 }
  }
};

export const buildRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: BuildRequestBody }>("/build/run", {
    schema: {
      body: buildRequestBodySchema
    }
  }, async (request) => {
    const middlewareRoot = path.resolve(__dirname, "..", "..");
    const runnerPath = path.resolve(middlewareRoot, "..", "build-runner", "runner.ts");
    const tsxPath = path.resolve(middlewareRoot, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");

    const payload = JSON.stringify({ name: request.body.name });

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve, reject) => {
      const child = spawn(tsxPath, [runnerPath, payload], {
        cwd: path.resolve(middlewareRoot, "..", "build-runner"),
        env: process.env
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", reject);
      child.on("close", (exitCode) => {
        resolve({ stdout, stderr, exitCode });
      });
    });

    if (result.exitCode !== 0) {
      throw new HttpError(500, "Build runner failed", {
        exitCode: result.exitCode,
        stderr: result.stderr.trim() || null
      });
    }

    let parsed: { ok?: boolean; outputDir?: string; template?: string };

    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      throw new HttpError(500, "Build runner returned invalid output", {
        stdout: result.stdout.trim() || null,
        stderr: result.stderr.trim() || null
      });
    }

    if (!parsed.outputDir) {
      throw new HttpError(500, "Build runner did not return an artifact path", {
        stdout: result.stdout.trim() || null
      });
    }

    return {
      ok: true,
      artifactPath: parsed.outputDir,
      template: parsed.template ?? null
    };
  });
};
