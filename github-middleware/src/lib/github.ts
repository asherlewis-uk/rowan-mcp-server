import { AppConfig, RepoTarget } from "../config";
import { HttpError } from "./http";
import { normalizeRepoPath } from "./paths";

interface CommitResponse {
  sha: string;
  commit: {
    tree: {
      sha: string;
    };
  };
}

interface TreeResponse {
  sha: string;
  tree: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
  }>;
  truncated?: boolean;
}

interface ContentFileResponse {
  type: "file";
  path: string;
  sha: string;
  size: number;
  content?: string;
  encoding?: string;
  html_url?: string | null;
  download_url?: string | null;
}

interface CreateRefResponse {
  ref: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
}

interface UpsertFileResponse {
  content: {
    path: string;
    sha: string;
  };
  commit: {
    sha: string;
    html_url?: string | null;
  };
}

interface PullRequestResponse {
  number: number;
  html_url: string;
  state: string;
  draft: boolean;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

export class GitHubRequestError extends HttpError {
  constructor(statusCode: number, message: string, details?: unknown) {
    super(statusCode, message, details);
    this.name = "GitHubRequestError";
  }
}

function encodePathSegments(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export class GitHubClient {
  constructor(private readonly config: AppConfig) {}

  private getRepoApiRoot(target?: RepoTarget): string {
    const repoTarget = target ?? this.config.githubDefaultRepoTarget;

    return `${this.config.githubApiBaseUrl.replace(/\/+$/, "")}/repos/${encodeURIComponent(repoTarget.owner)}/${encodeURIComponent(repoTarget.repo)}`;
  }

  private async request<T>(path: string, target?: RepoTarget, init?: RequestInit): Promise<T> {
    let response: Response;

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reach GitHub";
      throw new GitHubRequestError(502, "GitHub API request failed", { message });
    }

    const rawText = await response.text();
    let data: unknown;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : `GitHub API request failed with status ${response.status}`;

      throw new GitHubRequestError(response.status, message, data);
    }

    return data as T;
  }

  async getCommit(ref: string, target?: RepoTarget): Promise<CommitResponse> {
    return this.request<CommitResponse>(`/commits/${encodeURIComponent(ref)}`, target);
  }

  async getTree(ref: string, recursive: boolean, filterPath?: string, target?: RepoTarget) {
    const commit = await this.getCommit(ref, target);
    const normalizedPath = filterPath ? normalizeRepoPath(filterPath) : "";
    const shouldFetchRecursively = recursive || Boolean(normalizedPath);
    const recursiveQuery = shouldFetchRecursively ? "?recursive=1" : "";
    const tree = await this.request<TreeResponse>(`/git/trees/${commit.commit.tree.sha}${recursiveQuery}`, target);
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

  async getFile(path: string, ref: string, target?: RepoTarget): Promise<ContentFileResponse> {
    const normalizedPath = normalizeRepoPath(path);

    if (!normalizedPath) {
      throw new HttpError(400, "File path must not be empty");
    }

    const query = `?ref=${encodeURIComponent(ref)}`;
    const response = await this.request<ContentFileResponse | ContentFileResponse[]>(`/contents/${encodePathSegments(normalizedPath)}${query}`, target);

    if (Array.isArray(response) || response.type !== "file") {
      throw new HttpError(400, `Path "${normalizedPath}" is not a file`);
    }

    return response;
  }

  async createBranch(branch: string, from: string, target?: RepoTarget): Promise<CreateRefResponse> {
    const commit = await this.getCommit(from, target);
    return this.request<CreateRefResponse>("/git/refs", target, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: commit.sha
      })
    });
  }

  async upsertFile(input: {
    branch: string;
    path: string;
    content: string;
    message: string;
    sha?: string | null;
    encoding: "utf-8" | "base64";
    target?: RepoTarget;
  }): Promise<UpsertFileResponse & { created: boolean }> {
    const normalizedPath = normalizeRepoPath(input.path);

    if (!normalizedPath) {
      throw new HttpError(400, "File path must not be empty");
    }

    let existingSha = input.sha ?? undefined;
    let created = false;

    if (!existingSha) {
      try {
        const existingFile = await this.getFile(normalizedPath, input.branch, input.target);
        existingSha = existingFile.sha;
      } catch (error) {
        if (error instanceof GitHubRequestError && error.statusCode === 404) {
          created = true;
        } else {
          throw error;
        }
      }
    }

    const content = input.encoding === "base64"
      ? input.content
      : Buffer.from(input.content, "utf8").toString("base64");

    const response = await this.request<UpsertFileResponse>(`/contents/${encodePathSegments(normalizedPath)}`, input.target, {
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

  async openPullRequest(input: {
    head: string;
    base: string;
    title: string;
    body?: string;
    draft?: boolean;
    target?: RepoTarget;
  }): Promise<PullRequestResponse> {
    return this.request<PullRequestResponse>("/pulls", input.target, {
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
