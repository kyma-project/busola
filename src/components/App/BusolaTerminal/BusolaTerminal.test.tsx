import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { BusolaTerminal } from './BusolaTerminal';
import { clusterAtom } from 'state/clusterAtom';
import { showTerminalAtom } from 'state/showTerminalAtom';

vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    loadAddon: vi.fn(),
    open: vi.fn(),
    options: {},
    dispose: vi.fn(),
    onData: vi.fn(() => ({ dispose: vi.fn() })),
  })),
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({ fit: vi.fn() })),
}));

vi.mock('./useTerminalSession', () => ({
  useTerminalSession: () => ({ connect: vi.fn(), disconnect: vi.fn() }),
}));

vi.mock('@ui5/webcomponents-react', () => ({
  Button: () => null,
  Card: () => null,
  Title: () => null,
}));

window.matchMedia = vi.fn().mockReturnValue({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matches: false,
});

const makeCluster = (name: string) =>
  ({
    name,
    contextName: name,
    config: null,
    currentContext: {
      cluster: { cluster: { server: 'https://example.com' }, name },
      user: { user: {}, name: 'admin' },
      context: { cluster: name, user: 'admin' },
      name,
    },
    kubeconfig: {},
  }) as any;

describe('BusolaTerminal', () => {
  it('closes when the active cluster changes', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('cluster-a'));
    store.set(showTerminalAtom, {
      isDocked: true,
      isFullscreen: false,
      isOpen: true,
      dockedHeight: 0,
    });

    render(
      <Provider store={store}>
        <BusolaTerminal />
      </Provider>,
    );

    await act(async () => {
      store.set(clusterAtom, makeCluster('cluster-b'));
    });

    expect(store.get(showTerminalAtom).isOpen).toBe(false);
  });

  it('does not close when the cluster stays the same', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('cluster-a'));
    store.set(showTerminalAtom, {
      isDocked: true,
      isFullscreen: false,
      isOpen: true,
      dockedHeight: 0,
    });

    render(
      <Provider store={store}>
        <BusolaTerminal />
      </Provider>,
    );

    await act(async () => {
      store.set(clusterAtom, makeCluster('cluster-a'));
    });

    expect(store.get(showTerminalAtom).isOpen).toBe(true);
  });

  it('closes when switching back to the original cluster after reopening on a different cluster', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('cluster-a'));
    store.set(showTerminalAtom, {
      isDocked: true,
      isFullscreen: false,
      isOpen: true,
      dockedHeight: 0,
    });

    const { unmount } = render(
      <Provider store={store}>
        <BusolaTerminal />
      </Provider>,
    );

    // Switch to cluster-b — terminal closes
    await act(async () => {
      store.set(clusterAtom, makeCluster('cluster-b'));
    });
    expect(store.get(showTerminalAtom).isOpen).toBe(false);

    // Simulate terminal reopening on cluster-b: unmount the old instance and
    // mount a fresh one (openedOnClusterRef initializes to "cluster-b")
    unmount();
    store.set(showTerminalAtom, {
      isDocked: true,
      isFullscreen: false,
      isOpen: true,
      dockedHeight: 0,
    });
    render(
      <Provider store={store}>
        <BusolaTerminal />
      </Provider>,
    );

    // Switch back to cluster-a — terminal should close again
    await act(async () => {
      store.set(clusterAtom, makeCluster('cluster-a'));
    });

    expect(store.get(showTerminalAtom).isOpen).toBe(false);
  });

  it('closes when the cluster is cleared (e.g. user logs out)', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('cluster-a'));
    store.set(showTerminalAtom, {
      isDocked: true,
      isFullscreen: false,
      isOpen: true,
      dockedHeight: 0,
    });

    render(
      <Provider store={store}>
        <BusolaTerminal />
      </Provider>,
    );

    await act(async () => {
      store.set(clusterAtom, null);
    });

    expect(store.get(showTerminalAtom).isOpen).toBe(false);
  });
});
