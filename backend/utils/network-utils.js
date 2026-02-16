import net from 'net';
import dns from 'dns/promises';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_CACHE_SIZE = 1000;

const dnsCache = new Map();

export function isLocalDomain(hostname) {
  const localDomains = ['localhost', '127.0.0.1', '::1'];
  const localSuffixes = ['.localhost', '.local', '.internal'];

  if (localDomains.includes(hostname.toLowerCase())) {
    return true;
  }

  return localSuffixes.some((suffix) => hostname.endsWith(suffix));
}

export function isValidHost(hostname) {
  return !isLocalDomain(hostname) && net.isIP(hostname) === 0;
}

export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 127) return true; // 127.0.0.0/8
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16
  }
  if (net.isIPv6(ip)) {
    const lowerIp = ip.toLowerCase();
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true; // Unique local
    if (lowerIp.startsWith('fe80:')) return true; // Link-local
    if (lowerIp === '::1') return true; // Localhost
  }
  return false;
}

export async function isPrivateAddressCached(hostname) {
  // Check Cache
  if (dnsCache.has(hostname)) {
    const entry = dnsCache.get(hostname);

    dnsCache.delete(hostname);
    dnsCache.set(hostname, entry);

    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.isPrivate;
    }
  }

  // Perform Lookup
  let isPrivate = false;
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        isPrivate = true;
        break;
      }
    }
  } catch (err) {
    // Fail closed (secure) if DNS fails
    console.warn(`DNS lookup failed for ${hostname}:`, err.message);
    isPrivate = true;
  }

  if (dnsCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = dnsCache.keys().next().value;
    dnsCache.delete(oldestKey);
  }

  dnsCache.set(hostname, { timestamp: Date.now(), isPrivate });
  return isPrivate;
}
