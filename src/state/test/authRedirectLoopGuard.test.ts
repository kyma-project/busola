import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
  tryClaimReauthRedirect,
  resetReauthRedirectClaim,
} from '../utils/authRedirectLoopGuard';

describe('authRedirectLoopGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetReauthRedirectClaim();
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

  it('also releases the claim when the guard is reset', () => {
    expect(tryClaimReauthRedirect()).toBe(true);
    expect(tryClaimReauthRedirect()).toBe(false);
    resetAuthRedirectGuard();
    expect(tryClaimReauthRedirect()).toBe(true);
  });

  it('fails open on corrupted storage', () => {
    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, 'not json');
    expect(isAuthRedirectLoop()).toBe(false);
    expect(() => registerAuthRedirect()).not.toThrow();

    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, '{"a":1}');
    expect(isAuthRedirectLoop()).toBe(false);
  });
});

describe('tryClaimReauthRedirect', () => {
  beforeEach(() => {
    resetReauthRedirectClaim();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true on the first call', () => {
    expect(tryClaimReauthRedirect()).toBe(true);
  });

  it('returns false on a second call', () => {
    tryClaimReauthRedirect();
    expect(tryClaimReauthRedirect()).toBe(false);
  });

  it('can be claimed again after a reset', () => {
    tryClaimReauthRedirect();
    resetReauthRedirectClaim();
    expect(tryClaimReauthRedirect()).toBe(true);
  });

  it('lets the claim expire if the redirect never left the page', () => {
    tryClaimReauthRedirect();
    vi.advanceTimersByTime(29 * 1000);
    expect(tryClaimReauthRedirect()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(tryClaimReauthRedirect()).toBe(true);
  });

  it('cannot trip the loop guard from one page alone', () => {
    for (let elapsed = 0; elapsed <= 5 * 60; elapsed++) {
      if (tryClaimReauthRedirect()) registerAuthRedirect();
      expect(isAuthRedirectLoop()).toBe(false);
      vi.advanceTimersByTime(1000);
    }
  });

  it('releases the claim when the page is restored from the back/forward cache', () => {
    tryClaimReauthRedirect();
    window.dispatchEvent(
      Object.assign(new Event('pageshow'), { persisted: false }),
    );
    expect(tryClaimReauthRedirect()).toBe(false);
    window.dispatchEvent(
      Object.assign(new Event('pageshow'), { persisted: true }),
    );
    expect(tryClaimReauthRedirect()).toBe(true);
  });
});
