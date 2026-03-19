import { HttpError } from "./http";

export function normalizeRepoPath(path: string): string {
  const normalized = path
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  if (!normalized) {
    return "";
  }

  if (normalized.split("/").some((segment) => segment === "..")) {
    throw new HttpError(400, "Path may not contain '..'");
  }

  return normalized;
}
