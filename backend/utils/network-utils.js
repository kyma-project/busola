import net from 'net';
import dns from 'dns/promises';
import { PrivateIPUsedError } from './http-errors.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_CACHE_SIZE = 1000;

const dnsCache = new Map();

export { PrivateIPUsedError } from './http-errors.js';

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

const privateBlockList = new net.BlockList();
privateBlockList.addSubnet('0.0.0.0', 8, 'ipv4'); // unspecified / this-host
privateBlockList.addSubnet('10.0.0.0', 8, 'ipv4');
privateBlockList.addSubnet('100.64.0.0', 10, 'ipv4'); // CGNAT
privateBlockList.addSubnet('127.0.0.0', 8, 'ipv4'); // loopback
privateBlockList.addSubnet('169.254.0.0', 16, 'ipv4'); // link-local
privateBlockList.addSubnet('172.16.0.0', 12, 'ipv4');
privateBlockList.addSubnet('192.168.0.0', 16, 'ipv4');
privateBlockList.addAddress('::', 'ipv6'); // unspecified
privateBlockList.addAddress('::1', 'ipv6'); // loopback
privateBlockList.addSubnet('fc00::', 7, 'ipv6'); // unique local
privateBlockList.addSubnet('fe80::', 10, 'ipv6'); // link-local

function embeddedIpv4(ip) {
  const lower = ip.toLowerCase();
  if (lower.startsWith('::ffff:')) return lower.slice(7); // IPv4-mapped
  if (lower.startsWith('::') && lower.includes('.')) return lower.slice(2); // IPv4-compatible
  return null;
}

export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    return privateBlockList.check(ip, 'ipv4');
  }
  if (net.isIPv6(ip)) {
    const embedded = embeddedIpv4(ip);
    if (embedded && net.isIPv4(embedded)) {
      return isPrivateIp(embedded);
    }
    return privateBlockList.check(ip, 'ipv6');
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
    if (isPrivate || addresses.length === 0) {
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
