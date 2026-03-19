export type RepositoryStatus = 'Active' | 'In Progress' | 'Blocked' | 'Paused' | 'Archived';
export type RepositoryPriority = 'High' | 'Medium' | 'Low';

export interface RepositoryEntry {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: RepositoryStatus;
  priority: RepositoryPriority;
  stack: string;
  frameworks: string[];
  buildScheme: string;
  contains: string;
  purpose: string;
  lastUpdated: string;
  notes: string;
}

export interface RepositoryFormValues {
  name: string;
  slug: string;
  category: string;
  status: RepositoryStatus;
  priority: RepositoryPriority;
  stack: string;
  frameworks: string;
  buildScheme: string;
  contains: string;
  purpose: string;
  notes: string;
}

export interface RepositoryFilters {
  search: string;
  category: string;
  status: RepositoryStatus | 'All Statuses';
  stack: string;
}

export const repositorySeed: RepositoryEntry[] = [
  {
    id: 'repo-app-factory',
    name: 'App Factory',
    slug: 'app-factory',
    category: 'AI tool',
    status: 'Active',
    priority: 'High',
    stack: 'Next.js + Node',
    frameworks: ['Next.js', 'TypeScript', 'Docker'],
    buildScheme: 'Monorepo services with workflow-driven packaging',
    contains: 'UI workflows, build runner services, templates, schemas, and GitHub middleware',
    purpose: 'Generate, transform, and package internal application artifacts from structured requests.',
    lastUpdated: '2026-03-13',
    notes: 'Core orchestration repo. High visibility and active iteration across build and generation flows.'
  },
  {
    id: 'repo-client-portal',
    name: 'Client Portal',
    slug: 'client-portal',
    category: 'web app',
    status: 'In Progress',
    priority: 'High',
    stack: 'Next.js + Supabase',
    frameworks: ['Next.js', 'Supabase', 'SQLite'],
    buildScheme: 'Static admin shell with server actions and Supabase-backed data services',
    contains: 'Client dashboards, billing views, onboarding forms, and support request tooling',
    purpose: 'Provide clients with a single place to manage accounts, projects, and service requests.',
    lastUpdated: '2026-03-12',
    notes: 'Waiting on final auth policy review before rollout to additional client groups.'
  },
  {
    id: 'repo-mobile-companion',
    name: 'Mobile Companion',
    slug: 'mobile-companion',
    category: 'mobile app',
    status: 'Paused',
    priority: 'Medium',
    stack: 'Expo + React Native',
    frameworks: ['Expo', 'React Native', 'Supabase'],
    buildScheme: 'Expo managed workflow with OTA updates and shared API hooks',
    contains: 'Push notifications, mobile forms, offline sync, and lightweight activity feeds',
    purpose: 'Extend core project workflows to mobile for quick status checks and approvals.',
    lastUpdated: '2026-03-01',
    notes: 'Feature scope is solid, but delivery is paused until the web admin APIs are stabilized.'
  },
  {
    id: 'repo-desktop-lab',
    name: 'Desktop Lab',
    slug: 'desktop-lab',
    category: 'desktop app',
    status: 'Blocked',
    priority: 'High',
    stack: 'Tauri + Rust',
    frameworks: ['Tauri', 'Rust', 'SQLite'],
    buildScheme: 'Tauri shell with Rust commands, local SQLite persistence, and signed desktop bundles',
    contains: 'Native workspace tools, local data capture, sync jobs, and project diagnostics',
    purpose: 'Package internal tooling into a fast desktop utility for local-first operations.',
    lastUpdated: '2026-03-10',
    notes: 'Blocked by code-signing and auto-update pipeline decisions across macOS and Windows.'
  },
  {
    id: 'repo-api-core',
    name: 'API Core',
    slug: 'api-core',
    category: 'backend service',
    status: 'Active',
    priority: 'High',
    stack: 'Express + Docker',
    frameworks: ['Express', 'Docker', 'SQLite'],
    buildScheme: 'Containerized API service with typed routes, migrations, and deployment smoke tests',
    contains: 'REST endpoints, webhooks, auth guards, queue handlers, and reporting jobs',
    purpose: 'Serve shared application data and automation hooks for multiple front-end projects.',
    lastUpdated: '2026-03-11',
    notes: 'Healthy baseline. Needs additional observability before broader internal adoption.'
  },
  {
    id: 'repo-ui-kit',
    name: 'UI Kit',
    slug: 'ui-kit',
    category: 'shared library',
    status: 'Active',
    priority: 'Medium',
    stack: 'Vite + React',
    frameworks: ['Vite', 'React', 'TypeScript'],
    buildScheme: 'Versioned component library with Storybook-style preview and typed package exports',
    contains: 'Tokens, data table primitives, forms, cards, modals, and layout components',
    purpose: 'Keep visual consistency across dashboards, portals, and generated admin interfaces.',
    lastUpdated: '2026-03-08',
    notes: 'Stable and reusable. Next pass should improve accessibility test coverage.'
  },
  {
    id: 'repo-infra-stack',
    name: 'Infra Stack',
    slug: 'infra-stack',
    category: 'infrastructure',
    status: 'In Progress',
    priority: 'Medium',
    stack: 'Docker + Cloud tooling',
    frameworks: ['Docker', 'Terraform', 'GitHub Actions'],
    buildScheme: 'Composable deployment modules with container definitions and CI environment promotion',
    contains: 'Deployment manifests, CI workflows, reverse proxy config, and infrastructure automation',
    purpose: 'Standardize provisioning and deployment patterns for internal services and apps.',
    lastUpdated: '2026-03-13',
    notes: 'Currently being aligned with the latest deployment conventions and environment naming.'
  },
  {
    id: 'repo-playground-ml',
    name: 'Playground ML',
    slug: 'playground-ml',
    category: 'experiment',
    status: 'Archived',
    priority: 'Low',
    stack: 'Python + notebooks',
    frameworks: ['Python', 'Jupyter', 'Docker'],
    buildScheme: 'Research sandbox with notebooks, prompt experiments, and disposable inference workers',
    contains: 'Evaluation notebooks, data transforms, prototype prompts, and model comparison scripts',
    purpose: 'Explore AI-assisted workflows before promoting ideas into production-facing repositories.',
    lastUpdated: '2026-02-18',
    notes: 'Archived after the most promising ideas were moved into the main orchestration platform.'
  }
];

export const categoryOptions = ['All Categories', ...new Set(repositorySeed.map((item) => item.category))];
export const statusOptions: Array<RepositoryFilters['status']> = ['All Statuses', 'Active', 'In Progress', 'Blocked', 'Paused', 'Archived'];
export const stackOptions = ['All Stacks', ...new Set(repositorySeed.map((item) => item.stack))];
export const priorityOptions: RepositoryPriority[] = ['High', 'Medium', 'Low'];

export function filterRepositories(items: RepositoryEntry[], filters: RepositoryFilters): RepositoryEntry[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      [item.name, item.slug, item.category, item.stack, item.purpose, item.contains, item.frameworks.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(search);

    const matchesCategory = filters.category === 'All Categories' || item.category === filters.category;
    const matchesStatus = filters.status === 'All Statuses' || item.status === filters.status;
    const matchesStack = filters.stack === 'All Stacks' || item.stack === filters.stack;

    return matchesSearch && matchesCategory && matchesStatus && matchesStack;
  });
}

function normalizeFrameworks(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildNewRepository(values: RepositoryFormValues): RepositoryEntry {
  const trimmedSlug = values.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return {
    id: `repo-${trimmedSlug || Date.now()}`,
    name: values.name.trim(),
    slug: trimmedSlug,
    category: values.category.trim(),
    status: values.status,
    priority: values.priority,
    stack: values.stack.trim(),
    frameworks: normalizeFrameworks(values.frameworks),
    buildScheme: values.buildScheme.trim(),
    contains: values.contains.trim(),
    purpose: values.purpose.trim(),
    lastUpdated: new Date().toISOString().slice(0, 10),
    notes: values.notes.trim()
  };
}

export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
