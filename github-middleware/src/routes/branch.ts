import { FastifyPluginAsync } from "fastify";
import { AppConfig } from "../config";
import { ensureWritableBranch } from "../lib/branches";
import { GitHubClient } from "../lib/github";
import { resolveRepoTarget } from "../lib/repo-target";

interface BranchRoutesOptions {
  github: GitHubClient;
  config: AppConfig;
}

interface CreateBranchBody {
  owner?: string;
  repo?: string;
  branch: string;
  from?: string;
}

const branchNamePattern = "^(?!/)(?!.*//)[A-Za-z0-9._/-]+$";

const createBranchBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["branch"],
  properties: {
    owner: { type: "string", minLength: 1 },
    repo: { type: "string", minLength: 1 },
    branch: { type: "string", minLength: 1, pattern: branchNamePattern },
    from: { type: "string", minLength: 1 }
  }
};

export const branchRoutes: FastifyPluginAsync<BranchRoutesOptions> = async (app, options) => {
  app.post<{ Body: CreateBranchBody }>("/branch/create", {
    schema: {
      body: createBranchBodySchema
    }
  }, async (request, reply) => {
    const target = resolveRepoTarget(request.body, options.config);
    const branch = ensureWritableBranch(request.body.branch, options.config.githubDefaultBranch);
    const from = request.body.from ?? options.config.githubDefaultBranch;
    const result = await options.github.createBranch(branch, from, target);

    reply.code(201);
    return {
      owner: target.owner,
      repo: target.repo,
      branch,
      from,
      ref: result.ref,
      sha: result.object.sha
    };
  });
};
