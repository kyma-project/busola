export function setupMonaco(monaco) {
  // monaco editor - load from static files instead of from CDN
  monaco.config({ paths: { vs: '/vs' } });
}
