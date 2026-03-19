import { FastifyPluginAsync } from "fastify";
import { AppConfig } from "../config";
import { ensureWritableBranch } from "../lib/branches";
import { GitHubClient } from "../lib/github";
import { normalizeRepoPath } from "../lib/paths";
import { resolveRepoTarget } from "../lib/repo-target";

interface FilesRoutesOptions {
  github: GitHubClient;
  config: AppConfig;
}

interface UpsertFileBody {
  owner?: string;
  repo?: string;
  branch: string;
  path: string;
  content: string;
  message: string;
  sha?: string | null;
  encoding?: "utf-8" | "base64";
}

const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";

const upsertFileBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["branch", "path", "content", "message"],
  properties: {
    owner: { type: "string", minLength: 1 },
    repo: { type: "string", minLength: 1 },
    branch: { type: "string", minLength: 1, pattern: branchNamePattern },
    path: { type: "string", minLength: 1 },
    content: { type: "string" },
    message: { type: "string", minLength: 1 },
    sha: { type: ["string", "null"] },
    encoding: { type: "string", enum: ["utf-8", "base64"], default: "utf-8" }
  }
};

export const filesRoutes: FastifyPluginAsync<FilesRoutesOptions> = async (app, options) => {
  app.post<{ Body: UpsertFileBody }>("/files/upsert", {
    schema: {
      body: upsertFileBodySchema
    }
  }, async (request, reply) => {
    const target = resolveRepoTarget(request.body, options.config);
    const branch = ensureWritableBranch(request.body.branch, options.config.githubDefaultBranch);
    const path = normalizeRepoPath(request.body.path);

    const result = await options.github.upsertFile({
      target,
      branch,
      path,
      content: request.body.content,
      message: request.body.message,
      sha: request.body.sha,
      encoding: request.body.encoding ?? "utf-8"
    });

    reply.code(result.created ? 201 : 200);
    return {
      owner: target.owner,
      repo: target.repo,
      branch,
      path: result.content.path,
      fileSha: result.content.sha,
      commitSha: result.commit.sha,
      htmlUrl: result.commit.html_url ?? null
    };
  });
};
