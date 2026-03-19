import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { HttpError } from "./http";

const execFileAsync = promisify(execFile);
const LOCAL_REPO_ROOT = path.resolve(__dirname, "../../../..");
const LOCAL_ARTIFACTS_ROOT = path.join(LOCAL_REPO_ROOT, "services", "build-runner", "artifacts");

export interface LocalGitStatus {
  branch: string;
  clean: boolean;
  ahead: boolean;
  behind: boolean;
  diverged: boolean;
  trackingBranch: string | null;
}

export interface LocalArtifactEntry {
  path: string;
  name: string;
  type: "file" | "dir";
  size: number;
}

function normalizeRelativePath(input: string | undefined): string {
  const normalized = (input ?? "")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  if (!normalized) {
    return "";
  }

  if (normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new HttpError(400, "Invalid path");
  }

  return normalized;
}

function resolveContainedPath(root: string, relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const absolutePath = path.resolve(root, normalized);
  const relativeToRoot = path.relative(root, absolutePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new HttpError(400, "Path escapes allowed root");
  }

  return absolutePath;
}

async function runGit(args: string[]) {
  try {
    return await execFileAsync("git", args, {
      cwd: LOCAL_REPO_ROOT,
      windowsHide: true,
      encoding: "utf8"
    });
  } catch (error) {
    const details = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    throw new HttpError(400, "Git command failed", {
      args,
      stdout: details.stdout ?? "",
      stderr: details.stderr ?? "",
      code: details.code ?? null
    });
  }
}

async function toArtifactEntry(entryPath: string, isDirectory: boolean): Promise<LocalArtifactEntry> {
  const entryStat = await fs.stat(entryPath);

  return {
    path: path.relative(LOCAL_ARTIFACTS_ROOT, entryPath).replace(/\\/g, "/"),
    name: path.basename(entryPath),
    type: isDirectory ? "dir" : "file",
    size: entryStat.size
  };
}

async function listArtifactTreeRecursive(targetPath: string): Promise<LocalArtifactEntry[]> {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const results: LocalArtifactEntry[] = [];

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    results.push(await toArtifactEntry(entryPath, entry.isDirectory()));

    if (entry.isDirectory()) {
      results.push(...await listArtifactTreeRecursive(entryPath));
    }
  }

  return results;
}

export async function getLocalRepoStatus(): Promise<LocalGitStatus> {
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

export async function pullLocalRepo() {
  await runGit(["pull", "--ff-only"]);
  return getLocalRepoStatus();
}

export async function pushLocalRepo() {
  const before = await getLocalRepoStatus();
  await runGit(["push"]);
  const after = await getLocalRepoStatus();

  return {
    before,
    after
  };
}

export async function listArtifactTree(relativePath?: string, recursive = false): Promise<LocalArtifactEntry[]> {
  const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath ?? "");
  const stat = await fs.stat(targetPath).catch(() => {
    throw new HttpError(404, "Artifact path not found");
  });

  if (!stat.isDirectory()) {
    throw new HttpError(400, "Artifact path must be a directory");
  }

  if (recursive) {
    return listArtifactTreeRecursive(targetPath);
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });

  return Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(targetPath, entry.name);
    return toArtifactEntry(entryPath, entry.isDirectory());
  }));
}

export async function readArtifactFile(relativePath: string) {
  const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath);
  const stat = await fs.stat(targetPath).catch(() => {
    throw new HttpError(404, "Artifact file not found");
  });

  if (!stat.isFile()) {
    throw new HttpError(400, "Artifact path must be a file");
  }

  const content = await fs.readFile(targetPath, "utf8");

  return {
    path: path.relative(LOCAL_ARTIFACTS_ROOT, targetPath).replace(/\\/g, "/"),
    size: stat.size,
    content,
    encoding: "utf-8" as const
  };
}

export async function writeArtifactFile(relativePath: string, content: string) {
  const targetPath = resolveContainedPath(LOCAL_ARTIFACTS_ROOT, relativePath);
  const parentPath = path.dirname(targetPath);
  const parentStat = await fs.stat(parentPath).catch(() => {
    throw new HttpError(404, "Artifact parent directory not found");
  });

  if (!parentStat.isDirectory()) {
    throw new HttpError(400, "Artifact parent path must be a directory");
  }

  await fs.writeFile(targetPath, content, "utf8");
  const stat = await fs.stat(targetPath);

  return {
    path: path.relative(LOCAL_ARTIFACTS_ROOT, targetPath).replace(/\\/g, "/"),
    size: stat.size,
    content,
    encoding: "utf-8" as const
  };
}

export function getLocalRepoRoot(): string {
  return LOCAL_REPO_ROOT;
}

export function getLocalArtifactsRoot(): string {
  return LOCAL_ARTIFACTS_ROOT;
}
