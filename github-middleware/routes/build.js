"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutes = void 0;
const node_child_process_1 = require("node:child_process");
const node_path_1 = __importDefault(require("node:path"));
const http_1 = require("../lib/http");
const buildRequestBodySchema = {
    type: "object",
    additionalProperties: false,
    required: ["name"],
    properties: {
        name: { type: "string", minLength: 1 }
    }
};
const buildRoutes = async (app) => {
    app.post("/build/run", {
        schema: {
            body: buildRequestBodySchema
        }
    }, async (request) => {
        const middlewareRoot = node_path_1.default.resolve(__dirname, "..", "..");
        const runnerPath = node_path_1.default.resolve(middlewareRoot, "..", "build-runner", "runner.ts");
        const tsxPath = node_path_1.default.resolve(middlewareRoot, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
        const payload = JSON.stringify({ name: request.body.name });
        const result = await new Promise((resolve, reject) => {
            const child = (0, node_child_process_1.spawn)(tsxPath, [runnerPath, payload], {
                cwd: node_path_1.default.resolve(middlewareRoot, "..", "build-runner"),
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
            throw new http_1.HttpError(500, "Build runner failed", {
                exitCode: result.exitCode,
                stderr: result.stderr.trim() || null
            });
        }
        let parsed;
        try {
            parsed = JSON.parse(result.stdout);
        }
        catch {
            throw new http_1.HttpError(500, "Build runner returned invalid output", {
                stdout: result.stdout.trim() || null,
                stderr: result.stderr.trim() || null
            });
        }
        if (!parsed.outputDir) {
            throw new http_1.HttpError(500, "Build runner did not return an artifact path", {
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
exports.buildRoutes = buildRoutes;
