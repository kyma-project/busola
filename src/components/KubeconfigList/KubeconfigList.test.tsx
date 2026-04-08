import { expect, vi } from 'vitest';
import { atom } from 'jotai';
import React from 'react';

// atomWithStorage atoms (used by DynamicPageComponent's settings atoms) call
// localStorage.getItem at component mount. jsdom doesn't provide localStorage,
// so we stub it globally for this test file.
const localStorageStore: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => localStorageStore[k] ?? null,
  setItem: (k: string, v: string) => {
    localStorageStore[k] = v;
  },
  removeItem: (k: string) => {
    delete localStorageStore[k];
  },
  clear: () =>
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]),
});
vi.stubGlobal('sessionStorage', {
  getItem: (_k: string) => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
});

// UI5 webcomponents call checkVisibility which jsdom doesn't implement.
if (!Element.prototype.checkVisibility) {
  Element.prototype.checkVisibility = () => true;
}
vi.mock('state/clustersAtom', () => ({
  clustersAtom: atom(null),
  clustersAtomEffectSetSelf: atom(null),
  CLUSTERS_STORAGE_KEY: 'busola.clusters',
}));
vi.mock('state/clusterAtom', () => ({
  clusterAtom: atom<null, [null], void>(
    () => null,
    () => {},
  ),
}));
// DynamicPageComponent depends on several atomWithStorage atoms that call
// localStorage.getItem at mount — mock the entire component to isolate tests.
vi.mock('shared/components/DynamicPageComponent/DynamicPageComponent', () => ({
  DynamicPageComponent: ({
    title,
    content,
  }: {
    title: string;
    content: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {content}
    </div>
  ),
}));

import { render, screen, waitFor, fireEvent } from 'testing/reactTestingUtils';
import { KubeconfigList } from './KubeconfigList';

const mockSetCluster = vi.fn();
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>();
  return { ...actual, useSetAtom: () => mockSetCluster };
});

function mockFetch(data: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: () => Promise.resolve(data),
  });
}

describe('KubeconfigList', () => {
  describe('unit: rendering', () => {
    it('renders the page title', async () => {
      mockFetch([]);
      render(<KubeconfigList />);
      await waitFor(() => {
        expect(
          screen.getByText('clusters.kubeconfig-list.title'),
        ).toBeInTheDocument();
      });
    });

    it('renders a link for each kubeconfig file', async () => {
      mockFetch(['cluster-a.yaml', 'cluster-b.yaml']);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(screen.getByText('cluster-a.yaml')).toBeInTheDocument();
        expect(screen.getByText('cluster-b.yaml')).toBeInTheDocument();
      });
    });

    it('renders no rows when the file list is empty', async () => {
      mockFetch([]);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });

    it('strips .yaml extension from the link href', async () => {
      mockFetch(['my-cluster.yaml']);
      render(<KubeconfigList />);

      await waitFor(() => {
        const link = screen.getByText('my-cluster.yaml');
        expect(link).toHaveAttribute('href', '/kubeconfig/my-cluster');
      });
    });

    it('strips .yml extension from the link href', async () => {
      mockFetch(['my-cluster.yml']);
      render(<KubeconfigList />);

      await waitFor(() => {
        const link = screen.getByText('my-cluster.yml');
        expect(link).toHaveAttribute('href', '/kubeconfig/my-cluster');
      });
    });

    it('keeps non-yaml filenames unchanged in the href', async () => {
      mockFetch(['my-cluster']);
      render(<KubeconfigList />);

      await waitFor(() => {
        const link = screen.getByText('my-cluster');
        expect(link).toHaveAttribute('href', '/kubeconfig/my-cluster');
      });
    });
  });

  describe('unit: fetch behaviour', () => {
    it('calls GET /backend/kubeconfig on mount', async () => {
      mockFetch([]);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/backend/kubeconfig');
      });
    });

    it('calls fetch exactly once', async () => {
      mockFetch([]);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('logs an error and shows no rows when fetch returns a non-ok response', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetch(null, false);

      render(<KubeconfigList />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching kubeconfig files:',
          expect.any(String),
        );
      });
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('logs an error and shows no rows when fetch rejects', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      render(<KubeconfigList />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching kubeconfig files:',
          'Network failure',
        );
      });
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('integration: cluster atom reset on link click', () => {
    it('calls setCluster(null) when a link is clicked', async () => {
      mockFetch(['cluster-a.yaml']);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(screen.getByText('cluster-a.yaml')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('cluster-a.yaml'));

      expect(mockSetCluster).toHaveBeenCalledWith(null);
    });
  });

  describe('integration: multiple files with mixed extensions', () => {
    it('renders correct hrefs for a mixed list of filenames', async () => {
      mockFetch(['prod.yaml', 'staging.yml', 'dev']);
      render(<KubeconfigList />);

      await waitFor(() => {
        expect(screen.getByText('prod.yaml')).toHaveAttribute(
          'href',
          '/kubeconfig/prod',
        );
        expect(screen.getByText('staging.yml')).toHaveAttribute(
          'href',
          '/kubeconfig/staging',
        );
        expect(screen.getByText('dev')).toHaveAttribute(
          'href',
          '/kubeconfig/dev',
        );
      });
    });
  });
});
