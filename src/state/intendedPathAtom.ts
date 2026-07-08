const INTENDED_PATH_KEY = 'busola.intended-path';

export interface IntendedPath {
  path: string;
  kubeconfigId?: string;
  timestamp: number;
}

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

export function getIntendedPath(): IntendedPath | null {
  const data = sessionStorage.getItem(INTENDED_PATH_KEY);
  if (!data) return null;

  try {
    const parsed: IntendedPath = JSON.parse(data);
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

export function clearIntendedPath(): void {
  sessionStorage.removeItem(INTENDED_PATH_KEY);
}

// Strips the `/cluster/<name>` prefix; consumers re-prepend it on restore.
// A bare `/cluster/<name>` collapses to `/` to avoid a `/cluster/<name>/cluster/<name>` restore.
export function toClusterRelative(fullPath: string): string {
  const match = fullPath.match(/^\/cluster\/[^/]+(.*)$/);
  if (!match) return fullPath;
  return match[1] || '/';
}

export function initIntendedPathFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const kubeconfigId = params.get('kubeconfigID');
  const path = params.get('path');

  if (kubeconfigId && path) {
    saveIntendedPath(path, kubeconfigId);
  }
}
