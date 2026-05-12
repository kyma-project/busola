import { expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { KubeconfigRedirect } from './KubeconfigRedirect';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRoute(path: string) {
  const router = createMemoryRouter(
    [{ path: '/kubeconfig/:name', element: <KubeconfigRedirect /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('KubeconfigRedirect', () => {
  it('navigates with the .yaml suffix appended to the name param', () => {
    renderWithRoute('/kubeconfig/my-cluster');

    expect(mockNavigate).toHaveBeenCalledWith(
      '/?kubeconfigID=my-cluster.yaml',
      { replace: true },
    );
  });

  it('navigates with replace: true', () => {
    renderWithRoute('/kubeconfig/prod');

    expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
      replace: true,
    });
  });

  it('calls navigate exactly once on mount', () => {
    renderWithRoute('/kubeconfig/staging');

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('renders nothing (null)', () => {
    const { container } = renderWithRoute('/kubeconfig/my-cluster');

    expect(container.firstChild).toBeNull();
  });

  it('handles names with dots or dashes correctly', () => {
    renderWithRoute('/kubeconfig/my.cluster-01');

    expect(mockNavigate).toHaveBeenCalledWith(
      '/?kubeconfigID=my.cluster-01.yaml',
      { replace: true },
    );
  });
});
