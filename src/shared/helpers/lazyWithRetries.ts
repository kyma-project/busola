import { ComponentType, lazy } from 'react';

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
      if (isChunkLoadFailed) {
        const hasReloaded = sessionStorage.getItem('chunk-reload-attempted');

        if (!hasReloaded) {
          sessionStorage.setItem('chunk-reload-attempted', 'true');
          window.location.reload();
        }
        // After one failed reload attempt, let ErrorBoundary handle it
        throw error;
      }
      // If it's a normal error, throw it to be caught by an ErrorBoundary
      throw error;
    }
  });
};
