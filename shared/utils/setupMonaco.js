const isLocalDev = location.hostname.startsWith('localhost');

console.log(isLocalDev);
console.log('so path: ', isLocalDev ? '/vs' : '/assets/libs/vs');

export function setupMonaco(monaco) {
  // monaco editor - load from static files instead of from CDN
  monaco.config({ paths: { vs: isLocalDev ? '/vs' : '/assets/libs/vs' } });
}
