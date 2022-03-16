const isLocalDev = location.hostname.startsWith('localhost');

export function setupMonaco(loader) {
  // monaco editor - load from static files instead of from CDN
  loader.config({ paths: { vs: isLocalDev ? '/vs' : '/assets/libs/vs' } });
}
