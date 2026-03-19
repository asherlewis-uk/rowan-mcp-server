"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRoutes = void 0;
const branches_1 = require("../lib/branches");
const repo_target_1 = require("../lib/repo-target");
const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";
const createBranchBodySchema = {
    type: "object",
    additionalProperties: false,
    required: ["branch"],
    properties: {
        owner: { type: "string", minLength: 1 },
        repo: { type: "string", minLength: 1 },
        branch: { type: "string", minLength: 1, pattern: branchNamePattern },
        from: { type: "string", minLength: 1 }
    }
};
const branchRoutes = async (app, options) => {
    app.post("/branch/create", {
        schema: {
            body: createBranchBodySchema
        }
    }, async (request, reply) => {
        const target = (0, repo_target_1.resolveRepoTarget)(request.body, options.config);
        const branch = (0, branches_1.ensureWritableBranch)(request.body.branch, options.config.githubDefaultBranch);
        const from = request.body.from ?? options.config.githubDefaultBranch;
        const result = await options.github.createBranch(branch, from, target);
        reply.code(201);
        return {
            owner: target.owner,
            repo: target.repo,
            branch,
            from,
            ref: result.ref,
            sha: result.object.sha
        };
    });
};
exports.branchRoutes = branchRoutes;
