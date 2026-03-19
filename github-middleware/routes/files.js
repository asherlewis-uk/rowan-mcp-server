"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesRoutes = void 0;
const branches_1 = require("../lib/branches");
const paths_1 = require("../lib/paths");
const repo_target_1 = require("../lib/repo-target");
const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";
const upsertFileBodySchema = {
    type: "object",
    additionalProperties: false,
    required: ["branch", "path", "content", "message"],
    properties: {
        owner: { type: "string", minLength: 1 },
        repo: { type: "string", minLength: 1 },
        branch: { type: "string", minLength: 1, pattern: branchNamePattern },
        path: { type: "string", minLength: 1 },
        content: { type: "string" },
        message: { type: "string", minLength: 1 },
        sha: { type: ["string", "null"] },
        encoding: { type: "string", enum: ["utf-8", "base64"], default: "utf-8" }
    }
};
const filesRoutes = async (app, options) => {
    app.post("/files/upsert", {
        schema: {
            body: upsertFileBodySchema
        }
    }, async (request, reply) => {
        const target = (0, repo_target_1.resolveRepoTarget)(request.body, options.config);
        const branch = (0, branches_1.ensureWritableBranch)(request.body.branch, options.config.githubDefaultBranch);
        const path = (0, paths_1.normalizeRepoPath)(request.body.path);
        const result = await options.github.upsertFile({
            target,
            branch,
            path,
            content: request.body.content,
            message: request.body.message,
            sha: request.body.sha,
            encoding: request.body.encoding ?? "utf-8"
        });
        reply.code(result.created ? 201 : 200);
        return {
            owner: target.owner,
            repo: target.repo,
            branch,
            path: result.content.path,
            fileSha: result.content.sha,
            commitSha: result.commit.sha,
            htmlUrl: result.commit.html_url ?? null
        };
    });
};
exports.filesRoutes = filesRoutes;
