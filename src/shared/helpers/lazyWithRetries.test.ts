import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Component, createElement, ReactNode, Suspense } from 'react';
import {
  resetReauthRedirectClaim,
  tryClaimReauthRedirect,
} from 'state/utils/authRedirectLoopGuard';
import { lazyWithRetries } from './lazyWithRetries';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? 'failed' : this.props.children;
  }
}

function renderLazy(importer: () => Promise<never>) {
  const Lazy = lazyWithRetries(importer);
  render(
    createElement(
      Boundary,
      null,
      createElement(Suspense, { fallback: 'loading' }, createElement(Lazy)),
    ),
  );
}

describe('lazyWithRetries during a redirect to the IdP', () => {
  const chunkError = new TypeError('Importing a module script failed.');
  const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

  beforeEach(() => {
    resetReauthRedirectClaim();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    resetReauthRedirectClaim();
    vi.restoreAllMocks();
  });

  it('stays suspended while the redirect is pending and fails once it is abandoned', async () => {
    tryClaimReauthRedirect();
    renderLazy(() => Promise.reject(chunkError));
    await flush();
    expect(screen.getByText('loading')).toBeTruthy();

    act(() => resetReauthRedirectClaim());
    await flush();
    expect(screen.getByText('failed')).toBeTruthy();
  });

  it('fails right away when no redirect is pending', async () => {
    renderLazy(() => Promise.reject(chunkError));
    await flush();
    expect(screen.getByText('failed')).toBeTruthy();
  });
});
