'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  buildNewRepository,
  categoryOptions,
  filterRepositories,
  formatDate,
  priorityOptions,
  repositorySeed,
  stackOptions,
  statusOptions,
  type RepositoryEntry,
  type RepositoryFilters,
  type RepositoryFormValues,
} from '../lib/inventory';

const inputClassName =
  'h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20';

const panelClassName = 'rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/30 backdrop-blur';

const textareaClassName =
  'min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20';

const defaultFormValues: RepositoryFormValues = {
  name: '',
  slug: '',
  category: 'web app',
  status: 'Active',
  priority: 'Medium',
  stack: '',
  frameworks: '',
  buildScheme: '',
  contains: '',
  purpose: '',
  notes: '',
};

function statusPillClassName(status: RepositoryEntry['status']): string {
  if (status === 'Active') {
    return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20';
  }

  if (status === 'In Progress') {
    return 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/20';
  }

  if (status === 'Blocked') {
    return 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/20';
  }

  if (status === 'Paused') {
    return 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/20';
  }

  return 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/20';
}

function priorityPillClassName(priority: RepositoryEntry['priority']): string {
  if (priority === 'High') {
    return 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-400/20';
  }

  if (priority === 'Medium') {
    return 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20';
  }

  return 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/20';
}

function KPI({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className={`${panelClassName} p-5`}>
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <p className="max-w-[9rem] text-right text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span className="block font-medium">{label}</span>
      {children}
    </label>
  );
}

export function InventoryDashboard() {
  const [repositories, setRepositories] = useState<RepositoryEntry[]>(repositorySeed);
  const [filters, setFilters] = useState<RepositoryFilters>({
    search: '',
    category: 'All Categories',
    status: 'All Statuses',
    stack: 'All Stacks',
  });
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>(repositorySeed[0]?.id ?? '');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRepositoryId, setEditingRepositoryId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<RepositoryFormValues>(defaultFormValues);

  const filteredRepositories = useMemo(() => filterRepositories(repositories, filters), [repositories, filters]);

  const selectedRepository = useMemo(() => {
    return (
      filteredRepositories.find((item) => item.id === selectedRepositoryId) ??
      filteredRepositories[0] ??
      repositories[0] ??
      null
    );
  }, [filteredRepositories, repositories, selectedRepositoryId]);

  const metrics = useMemo(() => {
    const activeRepos = repositories.filter((repo) => repo.status === 'Active').length;
    const pausedRepos = repositories.filter((repo) => repo.status === 'Paused' || repo.status === 'Blocked').length;
    const highPriorityRepos = repositories.filter((repo) => repo.priority === 'High').length;
    const recentRepos = repositories.filter((repo) => {
      const updated = new Date(`${repo.lastUpdated}T00:00:00`).getTime();
      const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
      return updated >= sevenDaysAgo;
    }).length;

    return {
      totalRepos: repositories.length,
      activeRepos,
      pausedRepos,
      highPriorityRepos,
      recentRepos,
    };
  }, [repositories]);

  function updateFormValue<Key extends keyof RepositoryFormValues>(key: Key, value: RepositoryFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  function openCreateModal() {
    setEditingRepositoryId(null);
    setFormValues(defaultFormValues);
    setIsEditorOpen(true);
  }

  function openEditModal(repo: RepositoryEntry) {
    setEditingRepositoryId(repo.id);
    setFormValues({
      name: repo.name,
      slug: repo.slug,
      category: repo.category,
      status: repo.status,
      priority: repo.priority,
      stack: repo.stack,
      frameworks: repo.frameworks.join(', '),
      buildScheme: repo.buildScheme,
      contains: repo.contains,
      purpose: repo.purpose,
      notes: repo.notes,
    });
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingRepositoryId(null);
    setFormValues(defaultFormValues);
  }

  function submitRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRepository = buildNewRepository(formValues);

    if (editingRepositoryId) {
      const previous = repositories.find((repo) => repo.id === editingRepositoryId);
      const updatedRepository: RepositoryEntry = {
        ...nextRepository,
        id: editingRepositoryId,
        lastUpdated: previous?.lastUpdated ?? nextRepository.lastUpdated,
      };

      setRepositories((current) => current.map((repo) => (repo.id === editingRepositoryId ? updatedRepository : repo)));
      setSelectedRepositoryId(editingRepositoryId);
    } else {
      setRepositories((current) => [nextRepository, ...current]);
      setSelectedRepositoryId(nextRepository.id);
    }

    setFilters((current) => ({ ...current, search: '' }));
    closeEditor();
  }

  return (
    <main className="min-h-screen p-4 text-slate-100 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className={`${panelClassName} flex flex-col justify-between p-5`}>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-bold text-blue-300">
                GH
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workspace</p>
                <h1 className="text-lg font-semibold text-white">Repository Dashboard</h1>
              </div>
            </div>

            <nav className="mt-8 space-y-2 text-sm">
              {['Overview', 'Repositories', 'Architecture', 'Priorities', 'Activity'].map((item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    index === 0 ? 'bg-blue-500/15 text-white ring-1 ring-inset ring-blue-400/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                  type="button"
                >
                  <span>{item}</span>
                  <span className="text-xs text-slate-500">{index === 0 ? 'Live' : ''}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">Portfolio health</p>
            <p className="mt-2 text-sm text-slate-400">
              {metrics.pausedRepos} repositories need attention across blocked or paused workstreams, and {metrics.highPriorityRepos} are tagged high priority.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          <header className={`${panelClassName} flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between`}>
            <div>
              <p className="text-sm text-slate-400">Project workspace</p>
              <h2 className="text-2xl font-semibold text-white">GitHub repository command center</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="Search repositories"
                className={`${inputClassName} min-w-[220px]`}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search repo, stack, purpose..."
                value={filters.search}
              />
              <button
                className="h-11 rounded-xl bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-400"
                onClick={openCreateModal}
                type="button"
              >
                Add repository
              </button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KPI hint="Repositories tracked in this workspace" label="Total Repos" value={metrics.totalRepos} />
            <KPI hint="Currently active and moving forward" label="Active Repos" value={metrics.activeRepos} />
            <KPI hint="Paused or blocked workstreams" label="Paused / Stalled" value={metrics.pausedRepos} />
            <KPI hint="Items flagged for immediate focus" label="High Priority" value={metrics.highPriorityRepos} />
            <KPI hint="Updated in the past 7 days" label="Recently Updated" value={metrics.recentRepos} />
          </div>

          <section className={`${panelClassName} p-5`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Repository table</h3>
                <p className="text-sm text-slate-400">Track project type, stack, health, and purpose across your portfolio.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  aria-label="Category filter"
                  className={inputClassName}
                  onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
                  value={filters.category}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Status filter"
                  className={inputClassName}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value as RepositoryFilters['status'],
                    }))
                  }
                  value={filters.status}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Stack filter"
                  className={inputClassName}
                  onChange={(event) => setFilters((current) => ({ ...current, stack: event.target.value }))}
                  value={filters.stack}
                >
                  {stackOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-400">
                    <tr>
                      {['Repository Name', 'Category / Type', 'Stack / Build Scheme', 'Status', 'Primary Purpose', 'Last Updated'].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-medium">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-950/40 text-slate-200">
                    {filteredRepositories.map((repo) => {
                      const isSelected = selectedRepository?.id === repo.id;
                      return (
                        <tr
                          key={repo.id}
                          className={`cursor-pointer transition hover:bg-white/5 ${isSelected ? 'bg-white/5' : ''}`}
                          onClick={() => setSelectedRepositoryId(repo.id)}
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-white">{repo.name}</p>
                              <p className="text-xs text-slate-500">{repo.slug}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-300">{repo.category}</td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-slate-200">{repo.stack}</p>
                              <p className="text-xs text-slate-500">{repo.buildScheme}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusPillClassName(repo.status)}`}>
                              {repo.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-300">{repo.purpose}</td>
                          <td className="px-4 py-4 text-slate-400">{formatDate(repo.lastUpdated)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRepositories.length === 0 ? (
                <div className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                  No repositories matched the current search and filter combination.
                </div>
              ) : null}
            </div>
          </section>
        </section>

        <aside className={`${panelClassName} p-5`}>
          {selectedRepository ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Repository detail</p>
                  <h3 className="text-xl font-semibold text-white">{selectedRepository.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedRepository.slug}</p>
                </div>
                <div className="space-y-2 text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusPillClassName(selectedRepository.status)}`}>
                    {selectedRepository.status}
                  </span>
                  <span className={`block rounded-full px-3 py-1 text-xs font-medium ${priorityPillClassName(selectedRepository.priority)}`}>
                    {selectedRepository.priority} priority
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                  onClick={() => openEditModal(selectedRepository)}
                  type="button"
                >
                  Edit repository
                </button>
              </div>

              <dl className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Category</dt>
                  <dd>{selectedRepository.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Stack</dt>
                  <dd>{selectedRepository.stack}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Frameworks</dt>
                  <dd className="text-right">{selectedRepository.frameworks.join(', ')}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Architecture</dt>
                  <dd className="text-right">{selectedRepository.buildScheme}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Last Updated</dt>
                  <dd>{formatDate(selectedRepository.lastUpdated)}</dd>
                </div>
              </dl>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm font-medium text-white">Purpose</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedRepository.purpose}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm font-medium text-white">What it contains</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedRepository.contains}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm font-medium text-white">Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedRepository.notes}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
              Select a repository to review its details.
            </div>
          )}
        </aside>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className={`${panelClassName} w-full max-w-3xl p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{editingRepositoryId ? 'Edit repository' : 'Add repository'}</p>
                <h3 className="text-xl font-semibold text-white">
                  {editingRepositoryId ? 'Update repository metadata' : 'Create a new repository record'}
                </h3>
              </div>
              <button
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                onClick={closeEditor}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submitRepository}>
              <Field label="Repository name">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('name', event.target.value)}
                  placeholder="Ops Console"
                  required
                  value={formValues.name}
                />
              </Field>

              <Field label="Slug / identifier">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('slug', event.target.value)}
                  placeholder="ops-console"
                  required
                  value={formValues.slug}
                />
              </Field>

              <Field label="Category">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('category', event.target.value)}
                  placeholder="web app"
                  required
                  value={formValues.category}
                />
              </Field>

              <Field label="Stack / build scheme">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('stack', event.target.value)}
                  placeholder="Next.js + Supabase"
                  required
                  value={formValues.stack}
                />
              </Field>

              <Field label="Status">
                <select
                  className={inputClassName}
                  onChange={(event) => updateFormValue('status', event.target.value as RepositoryEntry['status'])}
                  value={formValues.status}
                >
                  {statusOptions
                    .filter((option) => option !== 'All Statuses')
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Priority">
                <select
                  className={inputClassName}
                  onChange={(event) => updateFormValue('priority', event.target.value as RepositoryEntry['priority'])}
                  value={formValues.priority}
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Frameworks">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('frameworks', event.target.value)}
                  placeholder="Next.js, Supabase, Docker"
                  required
                  value={formValues.frameworks}
                />
              </Field>

              <Field label="Architecture / build scheme">
                <input
                  className={inputClassName}
                  onChange={(event) => updateFormValue('buildScheme', event.target.value)}
                  placeholder="Monorepo app with deploy previews"
                  required
                  value={formValues.buildScheme}
                />
              </Field>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="block font-medium">Primary purpose</span>
                <textarea
                  className={textareaClassName}
                  onChange={(event) => updateFormValue('purpose', event.target.value)}
                  placeholder="Summarize the core job this repository is responsible for..."
                  required
                  value={formValues.purpose}
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="block font-medium">What it contains</span>
                <textarea
                  className={textareaClassName}
                  onChange={(event) => updateFormValue('contains', event.target.value)}
                  placeholder="Describe the major modules, apps, services, or packages inside the repo..."
                  required
                  value={formValues.contains}
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="block font-medium">Notes</span>
                <textarea
                  className={textareaClassName}
                  onChange={(event) => updateFormValue('notes', event.target.value)}
                  placeholder="Capture delivery notes, blockers, ownership context, or next actions..."
                  value={formValues.notes}
                />
              </label>

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  className="h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                  onClick={closeEditor}
                  type="button"
                >
                  Cancel
                </button>
                <button className="h-11 rounded-xl bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-400" type="submit">
                  {editingRepositoryId ? 'Save changes' : 'Save repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
