/**
 * Intended Path Storage Utility
 *
 * This module handles storing and retrieving the intended navigation path
 * for permalinks with kubeconfigID. The path is stored in sessionStorage
 * to survive OIDC redirects and page reloads.
 *
 * URL Format: /?kubeconfigID=abc123&path=/namespaces/default/pods
 */

const INTENDED_PATH_KEY = 'busola.intended-path';

export interface IntendedPath {
  path: string;
  kubeconfigId?: string;
  timestamp: number;
}

/**
 * Save the intended path to sessionStorage.
 * Only saves if the path is valid (not root or clusters page).
 */
export function saveIntendedPath(path: string, kubeconfigId?: string): void {
  if (path && path !== '/' && path !== '/clusters') {
    const data: IntendedPath = {
      path,
      kubeconfigId,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(INTENDED_PATH_KEY, JSON.stringify(data));
  }
}

/**
 * Get the intended path from sessionStorage.
 * Returns null if no path is stored or if the path has expired (5 minutes).
 */
export function getIntendedPath(): IntendedPath | null {
  const data = sessionStorage.getItem(INTENDED_PATH_KEY);
  if (!data) return null;

  try {
    const parsed: IntendedPath = JSON.parse(data);
    // Expire after 5 minutes to avoid stale redirects
    if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
      clearIntendedPath();
      return null;
    }
    return parsed;
  } catch {
    clearIntendedPath();
    return null;
  }
}

/**
 * Clear the intended path from sessionStorage.
 */
export function clearIntendedPath(): void {
  sessionStorage.removeItem(INTENDED_PATH_KEY);
}

/**
 * Initialize intended path from URL parameters.
 * Should be called early in the app initialization.
 */
export function initIntendedPathFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const kubeconfigId = params.get('kubeconfigID');
  const path = params.get('path');

  if (kubeconfigId && path) {
    saveIntendedPath(path, kubeconfigId);
  }
}
