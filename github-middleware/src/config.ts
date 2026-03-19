export interface RepoTarget {
  owner: string;
  repo: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiBearerToken: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubDefaultBranch: string;
  githubApiBaseUrl: string;
  githubAllowedRepos: RepoTarget[];
  githubDefaultRepoTarget: RepoTarget;
}

function requireEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function parseRepoTarget(rawValue: string): RepoTarget {
  const value = rawValue.trim();
  const parts = value.split("/").map((part) => part.trim()).filter(Boolean);

  if (parts.length !== 2) {
    throw new Error(`Invalid repository target: ${rawValue}`);
  }

  return {
    owner: parts[0],
    repo: parts[1]
  };
}

function repoTargetKey(target: RepoTarget): string {
  return `${target.owner}/${target.repo}`;
}

function parseAllowedRepos(value: string | undefined, defaultTarget: RepoTarget): RepoTarget[] {
  const parsed = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(parseRepoTarget);

  if (parsed.length === 0) {
    return [defaultTarget];
  }

  const unique = new Map<string, RepoTarget>();
  for (const target of parsed) {
    unique.set(repoTargetKey(target), target);
  }

  if (!unique.has(repoTargetKey(defaultTarget))) {
    throw new Error(
      `GITHUB_ALLOWED_REPOS must include the default repository ${repoTargetKey(defaultTarget)}`
    );
  }

  return Array.from(unique.values());
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const githubOwner = requireEnv("GITHUB_OWNER", env);
  const githubRepo = requireEnv("GITHUB_REPO", env);
  const githubDefaultRepoTarget = {
    owner: githubOwner,
    repo: githubRepo
  };

  return {
    nodeEnv: env.NODE_ENV?.trim() || "development",
    port: parsePort(env.PORT),
    apiBearerToken: requireEnv("API_BEARER_TOKEN", env),
    githubToken: requireEnv("GITHUB_TOKEN", env),
    githubOwner,
    githubRepo,
    githubDefaultBranch: env.GITHUB_DEFAULT_BRANCH?.trim() || "main",
    githubApiBaseUrl: env.GITHUB_API_BASE_URL?.trim() || "https://api.github.com",
    githubAllowedRepos: parseAllowedRepos(env.GITHUB_ALLOWED_REPOS, githubDefaultRepoTarget),
    githubDefaultRepoTarget
  };
}
