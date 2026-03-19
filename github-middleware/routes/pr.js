"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullRequestRoutes = void 0;
const branches_1 = require("../lib/branches");
const repo_target_1 = require("../lib/repo-target");
const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";
const openPullRequestBodySchema = {
    type: "object",
    additionalProperties: false,
    required: ["head", "title"],
    properties: {
        owner: { type: "string", minLength: 1 },
        repo: { type: "string", minLength: 1 },
        head: { type: "string", minLength: 1, pattern: branchNamePattern },
        base: { type: "string", minLength: 1, pattern: branchNamePattern },
        title: { type: "string", minLength: 1 },
        body: { type: "string" },
        draft: { type: "boolean", default: false }
    }
};
const pullRequestRoutes = async (app, options) => {
    app.post("/pr/open", {
        schema: {
            body: openPullRequestBodySchema
        }
    }, async (request, reply) => {
        const target = (0, repo_target_1.resolveRepoTarget)(request.body, options.config);
        const head = (0, branches_1.ensureWritableBranch)(request.body.head, options.config.githubDefaultBranch);
        const base = (0, branches_1.normalizeBranchName)(request.body.base ?? options.config.githubDefaultBranch);
        const pullRequest = await options.github.openPullRequest({
            target,
            head,
            base,
            title: request.body.title,
            body: request.body.body,
            draft: request.body.draft ?? false
        });
        reply.code(201);
        return {
            owner: target.owner,
            repo: target.repo,
            number: pullRequest.number,
            state: pullRequest.state,
            draft: pullRequest.draft,
            htmlUrl: pullRequest.html_url,
            head: pullRequest.head.ref,
            base: pullRequest.base.ref
        };
    });
};
exports.pullRequestRoutes = pullRequestRoutes;
