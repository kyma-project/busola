import { ComponentType, lazy } from 'react';
import {
  isReauthRedirectPending,
  subscribeReauthRedirect,
} from 'state/utils/authRedirectLoopGuard';

const untilReauthRedirectReleased = () =>
  new Promise<void>((resolve) => {
    const unsubscribe = subscribeReauthRedirect(() => {
      if (isReauthRedirectPending()) return;
      unsubscribe();
      resolve();
    });
  });

export const lazyWithRetries = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
) => {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error: any) {
      // Safari fails pending chunk loads once the IdP redirect starts, while the
      // old page is still on screen; stay suspended until the page has left.
      while (isReauthRedirectPending()) await untilReauthRedirectReleased();
      const isChunkLoadFailed = error?.message?.includes(
        'Failed to fetch dynamically imported module',
      );

      if (isChunkLoadFailed) {
        const lastReloadStr = sessionStorage.getItem(
          'busola_chunk_reload_time',
        );
        const now = Date.now();
        const isRecentReload =
          lastReloadStr && now - parseInt(lastReloadStr, 10) < 10000;

        if (!isRecentReload) {
          sessionStorage.setItem('busola_chunk_reload_time', now.toString());
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }

        console.error(
          'Chunk load failed even after a hard reload. The deployment might be missing assets.',
        );
      }

      throw error;
    }
  });
};
