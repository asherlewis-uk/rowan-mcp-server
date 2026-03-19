"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeBranchName = normalizeBranchName;
exports.ensureWritableBranch = ensureWritableBranch;
const http_1 = require("./http");
const RESERVED_BRANCHES = new Set(["main", "master"]);
function normalizeBranchName(branch) {
    return branch.replace(/^refs\/heads\//, "").trim();
}
function ensureWritableBranch(branch, defaultBranch) {
    const normalized = normalizeBranchName(branch);
    const protectedBranches = new Set([
        ...RESERVED_BRANCHES,
        normalizeBranchName(defaultBranch)
    ]);
    if (protectedBranches.has(normalized)) {
        throw new http_1.HttpError(400, `Writes to "${normalized}" are not allowed`);
    }
    return normalized;
}
