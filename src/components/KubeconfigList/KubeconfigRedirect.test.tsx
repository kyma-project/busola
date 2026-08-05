import { expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { KubeconfigRedirect } from './KubeconfigRedirect';

const mockNavigate = vi.fn();
const mockAddByContext = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('state/utils/getClustersInfo', () => ({
  useClustersInfo: () => ({
    navigate: mockNavigate,
    clusters: {},
    currentCluster: null,
    setCurrentCluster: vi.fn(),
    setClusters: vi.fn(),
    removeCluster: vi.fn(),
  }),
}));

vi.mock('components/Clusters/shared', () => ({
  addByContext: (...args: any[]) => mockAddByContext(...args),
}));

const mockKubeconfig = {
  'current-context': 'my-cluster',
  contexts: [
    { name: 'my-cluster', context: { cluster: 'my-cluster', user: 'my-user' } },
  ],
  clusters: [
    { name: 'my-cluster', cluster: { server: 'https://example.com' } },
  ],
  users: [{ name: 'my-user', user: { token: 'test-token' } }],
};

function renderWithRoute(path: string) {
  const router = createMemoryRouter(
    [{ path: '/kubeconfig/:name', element: <KubeconfigRedirect /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('KubeconfigRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches kubeconfig from backend and calls addByContext', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockKubeconfig)),
    });

    renderWithRoute('/kubeconfig/my-cluster');

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/backend/kubeconfig/my-cluster',
      );
      expect(mockAddByContext).toHaveBeenCalled();
    });
  });

  it('navigates to /clusters when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    renderWithRoute('/kubeconfig/missing');

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/clusters');
    });
  });

  it('renders nothing (null)', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockKubeconfig)),
    });

    const { container } = renderWithRoute('/kubeconfig/my-cluster');
    expect(container.firstChild).toBeNull();
  });
});
