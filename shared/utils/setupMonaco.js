const isLocalDev =
  location.hostname.startsWith('localhost') && location.port !== '3001'; // todo

export function setupMonaco(monaco) {
  // monaco editor - load from static files instead of from CDN
  monaco.config({ paths: { vs: isLocalDev ? '/vs' : '/assets/libs/vs' } });
}
