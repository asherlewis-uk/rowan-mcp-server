"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = exports.GitHubRequestError = void 0;
const http_1 = require("./http");
const paths_1 = require("./paths");
class GitHubRequestError extends http_1.HttpError {
    constructor(statusCode, message, details) {
        super(statusCode, message, details);
        this.name = "GitHubRequestError";
    }
}
exports.GitHubRequestError = GitHubRequestError;
function encodePathSegments(path) {
    return path
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}
class GitHubClient {
    config;
    constructor(config) {
        this.config = config;
    }
    getRepoApiRoot(target) {
        const repoTarget = target ?? this.config.githubDefaultRepoTarget;
        return `${this.config.githubApiBaseUrl.replace(/\/+$/, "")}/repos/${encodeURIComponent(repoTarget.owner)}/${encodeURIComponent(repoTarget.repo)}`;
    }
    async request(path, target, init) {
        let response;
        try {
            response = await fetch(`${this.getRepoApiRoot(target)}${path}`, {
                ...init,
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.config.githubToken}`,
                    "Content-Type": "application/json",
                    "User-Agent": "gpt-github-middleware",
                    "X-GitHub-Api-Version": "2022-11-28",
                    ...(init?.headers ?? {})
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to reach GitHub";
            throw new GitHubRequestError(502, "GitHub API request failed", { message });
        }
        const rawText = await response.text();
        let data;
        if (rawText) {
            try {
                data = JSON.parse(rawText);
            }
            catch {
                data = rawText;
            }
        }
        if (!response.ok) {
            const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
                ? data.message
                : `GitHub API request failed with status ${response.status}`;
            throw new GitHubRequestError(response.status, message, data);
        }
        return data;
    }
    async getCommit(ref, target) {
        return this.request(`/commits/${encodeURIComponent(ref)}`, target);
    }
    async getTree(ref, recursive, filterPath, target) {
        const commit = await this.getCommit(ref, target);
        const normalizedPath = filterPath ? (0, paths_1.normalizeRepoPath)(filterPath) : "";
        const shouldFetchRecursively = recursive || Boolean(normalizedPath);
        const recursiveQuery = shouldFetchRecursively ? "?recursive=1" : "";
        const tree = await this.request(`/git/trees/${commit.commit.tree.sha}${recursiveQuery}`, target);
        let entries = normalizedPath
            ? tree.tree.filter((entry) => entry.path.startsWith(`${normalizedPath}/`))
            : tree.tree;
        if (normalizedPath && !recursive) {
            entries = entries.filter((entry) => {
                const remainder = entry.path.slice(normalizedPath.length + 1);
                return !remainder.includes("/");
            });
        }
        return {
            treeSha: tree.sha,
            truncated: Boolean(tree.truncated),
            entries
        };
    }
    async getFile(path, ref, target) {
        const normalizedPath = (0, paths_1.normalizeRepoPath)(path);
        if (!normalizedPath) {
            throw new http_1.HttpError(400, "File path must not be empty");
        }
        const query = `?ref=${encodeURIComponent(ref)}`;
        const response = await this.request(`/contents/${encodePathSegments(normalizedPath)}${query}`, target);
        if (Array.isArray(response) || response.type !== "file") {
            throw new http_1.HttpError(400, `Path "${normalizedPath}" is not a file`);
        }
        return response;
    }
    async createBranch(branch, from, target) {
        const commit = await this.getCommit(from, target);
        return this.request("/git/refs", target, {
            method: "POST",
            body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: commit.sha
            })
        });
    }
    async upsertFile(input) {
        const normalizedPath = (0, paths_1.normalizeRepoPath)(input.path);
        if (!normalizedPath) {
            throw new http_1.HttpError(400, "File path must not be empty");
        }
        let existingSha = input.sha ?? undefined;
        let created = false;
        if (!existingSha) {
            try {
                const existingFile = await this.getFile(normalizedPath, input.branch, input.target);
                existingSha = existingFile.sha;
            }
            catch (error) {
                if (error instanceof GitHubRequestError && error.statusCode === 404) {
                    created = true;
                }
                else {
                    throw error;
                }
            }
        }
        const content = input.encoding === "base64"
            ? input.content
            : Buffer.from(input.content, "utf8").toString("base64");
        const response = await this.request(`/contents/${encodePathSegments(normalizedPath)}`, input.target, {
            method: "PUT",
            body: JSON.stringify({
                message: input.message,
                content,
                branch: input.branch,
                sha: existingSha
            })
        });
        return {
            ...response,
            created: created || !existingSha
        };
    }
    async openPullRequest(input) {
        return this.request("/pulls", input.target, {
            method: "POST",
            body: JSON.stringify({
                head: input.head,
                base: input.base,
                title: input.title,
                body: input.body,
                draft: input.draft
            })
        });
    }
}
exports.GitHubClient = GitHubClient;
