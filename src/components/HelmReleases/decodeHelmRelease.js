import { inflate } from 'pako';

export function decodeHelmRelease(encodedRelease) {
  try {
    // k8s & helm encoding
    const s = atob(atob(encodedRelease));

    // ungzip
    const charArray = s.split('').map(c => c.charCodeAt(0));
    const data = inflate(new Uint8Array(charArray));

    const decoder = new TextDecoder();
    const strRelease = decoder.decode(data);
    return JSON.parse(strRelease);
  } catch (e) {
    console.warn(e);
    return null;
  }
}
