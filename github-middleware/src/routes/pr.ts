import { FastifyPluginAsync } from "fastify";
import { AppConfig } from "../config";
import { ensureWritableBranch, normalizeBranchName } from "../lib/branches";
import { GitHubClient } from "../lib/github";
import { resolveRepoTarget } from "../lib/repo-target";

interface PullRequestRoutesOptions {
  github: GitHubClient;
  config: AppConfig;
}

interface OpenPullRequestBody {
  owner?: string;
  repo?: string;
  head: string;
  base?: string;
  title: string;
  body?: string;
  draft?: boolean;
}

const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";

const openPullRequestBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["head", "title"],
  properties: {
    owner: { type: "string", minLength: 1 },
    repo: { type: "string", minLength: 1 },
    head: { type: "string", minLength: 1, pattern: branchNamePattern },
    base: { type: "string", minLength: 1, pattern: branchNamePattern },
    title: { type: "string", minLength: 1 },
    body: { type: "string" },
    draft: { type: "boolean", default: false }
  }
};

export const pullRequestRoutes: FastifyPluginAsync<PullRequestRoutesOptions> = async (app, options) => {
  app.post<{ Body: OpenPullRequestBody }>("/pr/open", {
    schema: {
      body: openPullRequestBodySchema
    }
  }, async (request, reply) => {
    const target = resolveRepoTarget(request.body, options.config);
    const head = ensureWritableBranch(request.body.head, options.config.githubDefaultBranch);
    const base = normalizeBranchName(request.body.base ?? options.config.githubDefaultBranch);
    const pullRequest = await options.github.openPullRequest({
      target,
      head,
      base,
      title: request.body.title,
      body: request.body.body,
      draft: request.body.draft ?? false
    });

    reply.code(201);
    return {
      owner: target.owner,
      repo: target.repo,
      number: pullRequest.number,
      state: pullRequest.state,
      draft: pullRequest.draft,
      htmlUrl: pullRequest.html_url,
      head: pullRequest.head.ref,
      base: pullRequest.base.ref
    };
  });
};
