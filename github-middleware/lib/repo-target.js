"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRepoTarget = resolveRepoTarget;
const http_1 = require("./http");
function repoTargetKey(target) {
    return `${target.owner}/${target.repo}`;
}
function resolveRepoTarget(input, config) {
    const owner = input?.owner?.trim();
    const repo = input?.repo?.trim();
    if (!owner && !repo) {
        return config.githubDefaultRepoTarget;
    }
    if (!owner || !repo) {
        throw new http_1.HttpError(400, "Repository target requires both owner and repo");
    }
    const target = { owner, repo };
    const isAllowed = config.githubAllowedRepos.some((candidate) => repoTargetKey(candidate) === repoTargetKey(target));
    if (!isAllowed) {
        throw new http_1.HttpError(403, `Repository target ${repoTargetKey(target)} is not allowed`);
    }
    return target;
}
