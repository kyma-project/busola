// In the future we can try to use: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
// Generate Base64URL compatible output from Base64
// WebSocket web browser api has problems with =,/ chars
export function encodeBase64Url(str: string): string {
  return btoa(str)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}
