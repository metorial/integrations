import { ServiceError } from '@lowerdeck/error';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let confluenceClientMocks = vi.hoisted(() => ({
  search: vi.fn()
}));

vi.mock('../lib/helpers', () => ({
  createClient: vi.fn(() => confluenceClientMocks)
}));

import { resolveSearchContentQuery, searchContent } from './search-content';

let createCtx = (input: Record<string, unknown>) =>
  ({
    input,
    auth: { token: 'token', cloudId: 'cloud-id' },
    config: {}
  }) as any;

let searchResponse = {
  results: [
    {
      content: {
        id: 'page-1',
        type: 'page',
        title: 'CLI docs',
        space: { key: 'DEV', name: 'Development' },
        _links: { webui: '/wiki/spaces/DEV/pages/page-1' }
      },
      excerpt: 'tractivedev CLI devpod docdb'
    }
  ],
  size: 1,
  _links: {}
};

beforeEach(() => {
  confluenceClientMocks.search.mockReset();
  confluenceClientMocks.search.mockResolvedValue(searchResponse);
});

describe('Confluence search content', () => {
  it('converts plain query input to a Confluence text CQL search', async () => {
    let result = await searchContent.handleInvocation(
      createCtx({ query: 'tractivedev CLI devpod docdb', limit: 10 })
    );

    expect(confluenceClientMocks.search).toHaveBeenCalledWith({
      cql: 'text ~ "tractivedev CLI devpod docdb"',
      limit: 10,
      start: undefined,
      includeArchivedSpaces: undefined
    });
    expect(result.output.results).toHaveLength(1);
    expect(result.message).toContain('query: `tractivedev CLI devpod docdb`');
  });

  it('preserves explicit CQL searches unchanged', async () => {
    await searchContent.handleInvocation(createCtx({ cql: 'type=page AND space=DEV' }));

    expect(confluenceClientMocks.search).toHaveBeenCalledWith({
      cql: 'type=page AND space=DEV',
      limit: 25,
      start: undefined,
      includeArchivedSpaces: undefined
    });
  });

  it('escapes CQL string delimiters in plain query input', () => {
    expect(resolveSearchContentQuery({ query: 'docs "docdb" \\ setup' }).cql).toBe(
      'text ~ "docs \\"docdb\\" \\\\ setup"'
    );
  });

  it('rejects missing and conflicting search inputs with ServiceError', () => {
    expect(() => resolveSearchContentQuery({})).toThrow(ServiceError);
    expect(() =>
      resolveSearchContentQuery({
        cql: 'type=page',
        query: 'page'
      })
    ).toThrow(ServiceError);
  });
});
