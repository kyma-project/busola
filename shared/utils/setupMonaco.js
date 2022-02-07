const isLocalDev = location.hostname.startsWith('localhost');

export function setupMonaco(monaco) {
  // console.log(monaco)
  // monaco editor - load from static files instead of from CDN
  // monaco.config({ paths: { vs: isLocalDev ? '/vs' : '/assets/libs/vs' } });
}
