import { HttpError } from "./http";

const RESERVED_BRANCHES = new Set(["main", "master"]);

export function normalizeBranchName(branch: string): string {
  return branch.replace(/^refs\/heads\//, "").trim();
}

export function ensureWritableBranch(branch: string, defaultBranch: string): string {
  const normalized = normalizeBranchName(branch);
  const protectedBranches = new Set([
    ...RESERVED_BRANCHES,
    normalizeBranchName(defaultBranch)
  ]);

  if (protectedBranches.has(normalized)) {
    throw new HttpError(400, `Writes to "${normalized}" are not allowed`);
  }

  return normalized;
}
