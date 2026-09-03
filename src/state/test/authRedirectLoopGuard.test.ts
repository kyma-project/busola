import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
} from '../utils/authRedirectLoopGuard';

describe('authRedirectLoopGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lets the first redirects pass', () => {
    expect(isAuthRedirectLoop()).toBe(false);
    registerAuthRedirect();
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(false);
  });

  it('detects a loop after three redirects inside the window', () => {
    registerAuthRedirect();
    vi.advanceTimersByTime(1000);
    registerAuthRedirect();
    vi.advanceTimersByTime(1000);
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(true);
  });

  it('forgets redirects older than the window', () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    vi.advanceTimersByTime(61 * 1000);
    expect(isAuthRedirectLoop()).toBe(false);
    // Old entries also get removed from storage on the next register.
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(false);
  });

  it('resets on demand', () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(true);
    resetAuthRedirectGuard();
    expect(isAuthRedirectLoop()).toBe(false);
  });

  it('fails open on corrupted storage', () => {
    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, 'not json');
    expect(isAuthRedirectLoop()).toBe(false);
    expect(() => registerAuthRedirect()).not.toThrow();

    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, '{"a":1}');
    expect(isAuthRedirectLoop()).toBe(false);
  });
});
