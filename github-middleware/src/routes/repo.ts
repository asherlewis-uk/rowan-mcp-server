import { FastifyPluginAsync } from "fastify";
import { AppConfig } from "../config";
import { GitHubClient } from "../lib/github";
import { normalizeRepoPath } from "../lib/paths";
import { resolveRepoTarget } from "../lib/repo-target";
import { getLocalRepoRoot, getLocalRepoStatus, pullLocalRepo, pushLocalRepo } from "../lib/local";

interface RepoRoutesOptions {
  github: GitHubClient;
  config: AppConfig;
}

interface RepoTreeQuery {
  owner?: string;
  repo?: string;
  ref?: string;
  path?: string;
  recursive?: boolean;
}

interface RepoFileQuery {
  owner?: string;
  repo?: string;
  path: string;
  ref?: string;
}

const repoTreeQuerySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    owner: { type: "string", minLength: 1 },
    repo: { type: "string", minLength: 1 },
    ref: { type: "string", minLength: 1 },
    path: { type: "string", minLength: 1 },
    recursive: { type: "boolean", default: false }
  }
};

const repoFileQuerySchema = {
  type: "object",
  additionalProperties: false,
  required: ["path"],
  properties: {
    owner: { type: "string", minLength: 1 },
    repo: { type: "string", minLength: 1 },
    path: { type: "string", minLength: 1 },
    ref: { type: "string", minLength: 1 }
  }
};

export const repoRoutes: FastifyPluginAsync<RepoRoutesOptions> = async (app, options) => {
  app.get<{ Querystring: RepoTreeQuery }>("/repo/tree", {
    schema: {
      querystring: repoTreeQuerySchema
    }
  }, async (request) => {
    const target = resolveRepoTarget(request.query, options.config);
    const ref = request.query.ref ?? options.config.githubDefaultBranch;
    const path = request.query.path ? normalizeRepoPath(request.query.path) : "";
    const recursive = request.query.recursive ?? false;
    const tree = await options.github.getTree(ref, recursive, path, target);

    return {
      owner: target.owner,
      repo: target.repo,
      ref,
      path,
      recursive,
      count: tree.entries.length,
      truncated: tree.truncated,
      tree: tree.entries
    };
  });

  app.get<{ Querystring: RepoFileQuery }>("/repo/file", {
    schema: {
      querystring: repoFileQuerySchema
    }
  }, async (request) => {
    const target = resolveRepoTarget(request.query, options.config);
    const ref = request.query.ref ?? options.config.githubDefaultBranch;
    const path = normalizeRepoPath(request.query.path);
    const file = await options.github.getFile(path, ref, target);
    const decodedContent = file.encoding === "base64" && file.content
      ? Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8")
      : file.content ?? "";

    return {
      owner: target.owner,
      repo: target.repo,
      ref,
      file: {
        path: file.path,
        sha: file.sha,
        size: file.size,
        content: decodedContent,
        encoding: "utf-8",
        htmlUrl: file.html_url ?? null,
        downloadUrl: file.download_url ?? null
      }
    };
  });

  app.post("/repo/status", async () => {
    const status = await getLocalRepoStatus();

    return {
      repoRoot: getLocalRepoRoot(),
      ...status
    };
  });

  app.post("/repo/sync/pull", async () => {
    const status = await pullLocalRepo();

    return {
      repoRoot: getLocalRepoRoot(),
      action: "pull",
      ...status
    };
  });

  app.post("/repo/sync/push", async () => {
    const result = await pushLocalRepo();

    return {
      repoRoot: getLocalRepoRoot(),
      action: "push",
      ...result
    };
  });
};
