import { ComponentType, lazy } from 'react';

let hasReloadedForChunkError = false;

export const lazyWithRetries = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
) => {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error: any) {
      // Safely check if the error is the specific Vite chunk load error
      const isChunkLoadFailed = error?.message?.includes(
        'Failed to fetch dynamically imported module',
      );
      if (isChunkLoadFailed && !hasReloadedForChunkError) {
        hasReloadedForChunkError = true;
        window.location.reload();

        return new Promise<{ default: T }>(() => {});
      }
      // If it's a normal error, throw it to be caught by an ErrorBoundary
      throw error;
    }
  });
};
