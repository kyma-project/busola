import net from 'net';
import dns from 'dns/promises';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_CACHE_SIZE = 1000;

const dnsCache = new Map();

// Node's default of 250ms per address is too short for slow connections:
// the IPv4 attempt gets dropped before it can finish.
export const CONNECT_ATTEMPT_TIMEOUT_MS = 2000;

export class PrivateIPUsedError extends Error {}

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
    if (lowerIp.startsWith('::ffff:')) return isPrivateIp(lowerIp.slice(7)); // IPv4-mapped IPv6
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true; // Unique local
    if (lowerIp.startsWith('fe80:')) return true; // Link-local
    if (lowerIp === '::1') return true; // Localhost
  }
  return false;
}

async function resolveAddressesCached(hostname) {
  // Check Cache
  if (dnsCache.has(hostname)) {
    const entry = dnsCache.get(hostname);

    /* When something is inserted into the map, the insertion order is remembered.
   We move the most-recently-touched DNS entry to the end so it isn't removed
   first when the cache is full. */
    dnsCache.delete(hostname);
    dnsCache.set(hostname, entry);

    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return { isPrivate: entry.isPrivate, addresses: entry.addresses };
    }
  }

  // Perform Lookup
  let isPrivate = false;
  let addresses = [];
  try {
    // Keep every A/AAAA record so the socket can fall back between families.
    addresses = await dns.lookup(hostname, { all: true });
    // Block if any resolved address is private (SSRF / DNS-rebinding defense).
    isPrivate = addresses.some((addr) => isPrivateIp(addr.address));
  } catch (err) {
    // Fail closed (secure) if DNS fails, but do not cache the failure:
    // a transient DNS outage would otherwise keep a valid cluster blocked
    // for the full cache TTL. Leaving it uncached lets the next request retry.
    console.warn(`DNS lookup failed for ${hostname}:`, err.message);
    return { isPrivate: true, addresses: [] };
  }

  if (dnsCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = dnsCache.keys().next().value;
    dnsCache.delete(oldestKey);
  }

  dnsCache.set(hostname, { timestamp: Date.now(), isPrivate, addresses });
  return { isPrivate, addresses };
}

export async function resolveOrBlockPrivateIpAddress(hostname, opts, callback) {
  try {
    const { isPrivate, addresses } = await resolveAddressesCached(hostname);
    if (addresses.length === 0) {
      callback(
        new PrivateIPUsedError(
          `The provided hostname: ${hostname} could not be resolved`,
        ),
      );
    } else if (isPrivate) {
      callback(
        new PrivateIPUsedError(
          `The provided hostname: ${hostname} is private IP`,
        ),
      );
    } else if (opts?.all) {
      // Return all addresses, IPv4 first, so an IPv4-only host connects first
      // while IPv6 stays available as a fallback.
      const ipv4First = [...addresses].sort((a, b) => a.family - b.family);
      callback(null, ipv4First);
    } else {
      // Prefer IPv4 for single-address callers; fall back to the first address.
      const preferred =
        addresses.find((addr) => addr.family === 4) ?? addresses[0];
      callback(null, preferred.address, preferred.family);
    }
  } catch (err) {
    callback(err);
  }
}
