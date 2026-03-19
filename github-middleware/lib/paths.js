"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRepoPath = normalizeRepoPath;
const http_1 = require("./http");
function normalizeRepoPath(path) {
    const normalized = path
        .replace(/\\/g, "/")
        .replace(/^\/+|\/+$/g, "")
        .trim();
    if (!normalized) {
        return "";
    }
    if (normalized.split("/").some((segment) => segment === "..")) {
        throw new http_1.HttpError(400, "Path may not contain '..'");
    }
    return normalized;
}
