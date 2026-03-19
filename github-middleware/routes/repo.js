"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoRoutes = void 0;
const paths_1 = require("../lib/paths");
const repo_target_1 = require("../lib/repo-target");
const local_1 = require("../lib/local");
const repoTreeQuerySchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        owner: { type: "string", minLength: 1 },
        repo: { type: "string", minLength: 1 },
        ref: { type: "string", minLength: 1 },
        path: { type: "string", minLength: 1 },
        recursive: { type: "boolean", default: false }
    }
};
const repoFileQuerySchema = {
    type: "object",
    additionalProperties: false,
    required: ["path"],
    properties: {
        owner: { type: "string", minLength: 1 },
        repo: { type: "string", minLength: 1 },
        path: { type: "string", minLength: 1 },
        ref: { type: "string", minLength: 1 }
    }
};
const repoRoutes = async (app, options) => {
    app.get("/repo/tree", {
        schema: {
            querystring: repoTreeQuerySchema
        }
    }, async (request) => {
        const target = (0, repo_target_1.resolveRepoTarget)(request.query, options.config);
        const ref = request.query.ref ?? options.config.githubDefaultBranch;
        const path = request.query.path ? (0, paths_1.normalizeRepoPath)(request.query.path) : "";
        const recursive = request.query.recursive ?? false;
        const tree = await options.github.getTree(ref, recursive, path, target);
        return {
            owner: target.owner,
            repo: target.repo,
            ref,
            path,
            recursive,
            count: tree.entries.length,
            truncated: tree.truncated,
            tree: tree.entries
        };
    });
    app.get("/repo/file", {
        schema: {
            querystring: repoFileQuerySchema
        }
    }, async (request) => {
        const target = (0, repo_target_1.resolveRepoTarget)(request.query, options.config);
        const ref = request.query.ref ?? options.config.githubDefaultBranch;
        const path = (0, paths_1.normalizeRepoPath)(request.query.path);
        const file = await options.github.getFile(path, ref, target);
        const decodedContent = file.encoding === "base64" && file.content
            ? Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8")
            : file.content ?? "";
        return {
            owner: target.owner,
            repo: target.repo,
            ref,
            file: {
                path: file.path,
                sha: file.sha,
                size: file.size,
                content: decodedContent,
                encoding: "utf-8",
                htmlUrl: file.html_url ?? null,
                downloadUrl: file.download_url ?? null
            }
        };
    });
    app.post("/repo/status", async () => {
        const status = await (0, local_1.getLocalRepoStatus)();
        return {
            repoRoot: (0, local_1.getLocalRepoRoot)(),
            ...status
        };
    });
    app.post("/repo/sync/pull", async () => {
        const status = await (0, local_1.pullLocalRepo)();
        return {
            repoRoot: (0, local_1.getLocalRepoRoot)(),
            action: "pull",
            ...status
        };
    });
    app.post("/repo/sync/push", async () => {
        const result = await (0, local_1.pushLocalRepo)();
        return {
            repoRoot: (0, local_1.getLocalRepoRoot)(),
            action: "push",
            ...result
        };
    });
};
exports.repoRoutes = repoRoutes;
