import { describe, expect, it } from 'vitest';
import { buildNewRepository, filterRepositories, repositorySeed } from './inventory';

describe('repository helpers', () => {
  it('filters by search, category, status, and stack together', () => {
    const results = filterRepositories(repositorySeed, {
      search: 'native workspace',
      category: 'desktop app',
      status: 'Blocked',
      stack: 'Tauri + Rust',
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('Desktop Lab');
  });

  it('builds a new repository entry with normalized values', () => {
    const repo = buildNewRepository({
      name: '  Ops Console  ',
      slug: ' Ops Console ',
      category: 'web app',
      status: 'Active',
      priority: 'High',
      stack: '  Next.js + Supabase  ',
      frameworks: ' Next.js, Supabase, Docker ',
      buildScheme: '  Server actions with deploy preview checks  ',
      contains: '  admin views, queues, and reporting panels  ',
      purpose: '  Manage operations workflows  ',
      notes: '  Needs role-based navigation  ',
    });

    expect(repo.name).toBe('Ops Console');
    expect(repo.slug).toBe('ops-console');
    expect(repo.stack).toBe('Next.js + Supabase');
    expect(repo.frameworks).toEqual(['Next.js', 'Supabase', 'Docker']);
    expect(repo.purpose).toBe('Manage operations workflows');
    expect(repo.notes).toBe('Needs role-based navigation');
  });
});
