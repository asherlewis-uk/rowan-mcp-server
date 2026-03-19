import { AppConfig, RepoTarget } from "../config";
import { HttpError } from "./http";

interface RepoTargetInput {
  owner?: string;
  repo?: string;
}

function repoTargetKey(target: RepoTarget): string {
  return `${target.owner}/${target.repo}`;
}

export function resolveRepoTarget(input: RepoTargetInput | undefined, config: AppConfig): RepoTarget {
  const owner = input?.owner?.trim();
  const repo = input?.repo?.trim();

  if (!owner && !repo) {
    return config.githubDefaultRepoTarget;
  }

  if (!owner || !repo) {
    throw new HttpError(400, "Repository target requires both owner and repo");
  }

  const target = { owner, repo };
  const isAllowed = config.githubAllowedRepos.some((candidate) => repoTargetKey(candidate) === repoTargetKey(target));

  if (!isAllowed) {
    throw new HttpError(403, `Repository target ${repoTargetKey(target)} is not allowed`);
  }

  return target;
}
