"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalRepoStatus = getLocalRepoStatus;
exports.pullLocalRepo = pullLocalRepo;
exports.pushLocalRepo = pushLocalRepo;
exports.listArtifactTree = listArtifactTree;
exports.readArtifactFile = readArtifactFile;
exports.writeArtifactFile = writeArtifactFile;
exports.getLocalRepoRoot = getLocalRepoRoot;
exports.getLocalArtifactsRoot = getLocalArtifactsRoot;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const http_1 = require("./http");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const LOCAL_REPO_ROOT = node_path_1.default.resolve(__dirname, "../../../..");
const LOCAL_ARTIFACTS_ROOT = node_path_1.default.join(LOCAL_REPO_ROOT, "services", "build-runner", "artifacts");
function normalizeRelativePath(input) {
    const normalized = (input ?? "")
        .replace(/\\/g, "/")
        .replace(/^\/+|\/+$/g, "")
        .trim();
    if (!normalized) {
        return "";
    }
    if (normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
        throw new http_1.HttpError(400, "Invalid path");
    }
    return normalized;
}
function resolveContainedPath(root, relativePath) {
    const normalized = normalizeRelativePath(relativePath);
    const absolutePath = node_path_1.default.resolve(root, normalized);
    const relativeToRoot = node_path_1.default.relative(root, absolutePath);
    if (relativeToRoot.startsWith("..") || node_path_1.default.isAbsolute(relativeToRoot)) {
        throw new http_1.HttpError(400, "Path escapes allowed root");
    }
    return absolutePath;
}
async function runGit(args) {
    try {
        return await execFileAsync("git", args, {
            cwd: LOCAL_REPO_ROOT,
            windowsHide: true,
            encoding: "utf8"
        });
    }
    catch (error) {
        const details = error;
        throw new http_1.HttpError(400, "Git command failed", {
            args,
            stdout: details.stdout ?? "",
            stderr: details.stderr ?? "",
            code: details.code ?? null
        });
    }
}
async function toArtifactEntry(entryPath, isDirectory) {
    const entryStat = await node_fs_1.promises.stat(entryPath);
    return {
        path: node_path_1.default.relative(LOCAL_ARTIFACTS_ROOT, entryPath).replace(/\\/g, "/"),
        name: node_path_1.default.basename(entryPath),
        type: isDirectory ? "dir" : "file",
        size: entryStat.size
    };
}
async function listArtifactTreeRecursive(targetPath) {
    const entries = await node_fs_1.promises.readdir(targetPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
        const entryPath = node_path_1.default.join(targetPath, entry.name);
        results.push(await toArtifactEntry(entryPath, entry.isDirectory()));
        if (entry.isDirectory()) {
            results.push(...await listArtifactTreeRecursive(entryPath));
        }
    }
    return results;
}
async function getLocalRepoStatus() {
    const { stdout } = await runGit(["status", "--porcelain=v1", "--branch"]);
    const lines = stdout.split(/\r?\n/).filter(Boolean);
    const header = lines[0] ?? "## HEAD";
    const changes = lines.slice(1);
    const branchMatch = /^## (?<branch>[^.]+)(?:\.\.\.(?<tracking>[^ ]+))?(?: \[(?<flags>.+)\])?$/.exec(header);
    const branch = branchMatch?.groups?.branch?.trim() || "HEAD";
    const trackingBranch = branchMatch?.groups?.tracking?.trim() || null;
    const flags = branchMatch?.groups?.flags || "";
    const aheadMatch = /ahead (\d+)/.exec(flags);
    const behindMatch = /behind (\d+)/.exec(flags);
    const ahead = Boolean(aheadMatch && Number(aheadMatch[1]) > 0);
    const behind = Boolean(behindMatch && Number(behindMatch[1]) > 0);
    return {
        branch,
        clean: changes.length === 0,
        ahead,
        behind,
        diverged: ahead && behind,
        trackingBranch
    };
}
async function pullLocalRepo() {
    await runGit(["pull", "--ff-only"]);
    return getLocalRepoStatus();
}
async function pushLocalRepo() {
    const before = await getLocalRepoStatus();
    await runGit(["push"]);
    const after = await getLocalRepoStatus();
    return {
        before,
        after
    };
}
async function listArtifactTree(relativePath, recursive = false) {
    const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath ?? "");
    const stat = await node_fs_1.promises.stat(targetPath).catch(() => {
        throw new http_1.HttpError(404, "Artifact path not found");
    });
    if (!stat.isDirectory()) {
        throw new http_1.HttpError(400, "Artifact path must be a directory");
    }
    if (recursive) {
        return listArtifactTreeRecursive(targetPath);
    }
    const entries = await node_fs_1.promises.readdir(targetPath, { withFileTypes: true });
    return Promise.all(entries.map(async (entry) => {
        const entryPath = node_path_1.default.join(targetPath, entry.name);
        return toArtifactEntry(entryPath, entry.isDirectory());
    }));
}
async function readArtifactFile(relativePath) {
    const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath);
    const stat = await node_fs_1.promises.stat(targetPath).catch(() => {
        throw new http_1.HttpError(404, "Artifact file not found");
    });
    if (!stat.isFile()) {
        throw new http_1.HttpError(400, "Artifact path must be a file");
    }
    const content = await node_fs_1.promises.readFile(targetPath, "utf8");
    return {
        path: node_path_1.default.relative(LOCAL_ARTIFACTS_ROOT, targetPath).replace(/\\/g, "/"),
        size: stat.size,
        content,
        encoding: "utf-8"
    };
}
async function writeArtifactFile(relativePath, content) {
    const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath);
    const parentPath = node_path_1.default.dirname(targetPath);
    const parentStat = await node_fs_1.promises.stat(parentPath).catch(() => {
        throw new http_1.HttpError(404, "Artifact parent directory not found");
    });
    if (!parentStat.isDirectory()) {
        throw new http_1.HttpError(400, "Artifact parent path must be a directory");
    }
    await node_fs_1.promises.writeFile(targetPath, content, "utf8");
    const stat = await node_fs_1.promises.stat(targetPath);
    return {
        path: node_path_1.default.relative(LOCAL_ARTIFACTS_ROOT, targetPath).replace(/\\/g, "/"),
        size: stat.size,
        content,
        encoding: "utf-8"
    };
}
function getLocalRepoRoot() {
    return LOCAL_REPO_ROOT;
}
function getLocalArtifactsRoot() {
    return LOCAL_ARTIFACTS_ROOT;
}
