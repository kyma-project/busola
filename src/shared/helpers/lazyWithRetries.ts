import { ComponentType, lazy } from 'react';

export const lazyWithRetries = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
) => {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error: any) {
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
