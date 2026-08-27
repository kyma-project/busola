import net from 'net';
import dns from 'dns/promises';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_CACHE_SIZE = 1000;

const dnsCache = new Map();

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
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true; // Unique local
    if (lowerIp.startsWith('fe80:')) return true; // Link-local
    if (lowerIp === '::1') return true; // Localhost
  }
  return false;
}

async function isPrivateAddressCached(hostname) {
  // Check Cache
  if (dnsCache.has(hostname)) {
    const entry = dnsCache.get(hostname);

    /* When something is inserted into the map, the insertion order is remembered.
   We move the most-recently-touched DNS entry to the end so it isn't removed
   first when the cache is full. */
    dnsCache.delete(hostname);
    dnsCache.set(hostname, entry);

    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return {
        isPrivate: entry.isPrivate,
        ipAddress: entry.ipAddress,
        familyAddress: entry.familyAddress,
      };
    }
  }

  // Perform Lookup
  let isPrivate = false;
  let ipAddress = '';
  let familyAddress = 0;
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        isPrivate = true;
        break;
      }
    }
    // Connect to the first resolved address we validated above.
    if (addresses.length > 0) {
      ipAddress = addresses[0].address;
      familyAddress = addresses[0].family;
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

  dnsCache.set(hostname, {
    timestamp: Date.now(),
    isPrivate,
    ipAddress,
    familyAddress,
  });
  return { isPrivate, ipAddress, familyAddress };
}

export async function resolveOrBlockPrivateIpAddress(hostname, opts, callback) {
  try {
    const result = await isPrivateAddressCached(hostname);
    if (result.isPrivate) {
      callback(
        new PrivateIPUsedError(
          `The provided hostname: ${hostname} is private IP`,
        ),
      );
    } else if (opts?.all) {
      // With the all option set to true, the arguments for callback change to (err, addresses),
      // with addresses being an array of objects with the properties address and family.
      callback(null, [
        { address: result.ipAddress, family: result.familyAddress },
      ]);
    } else {
      callback(null, result.ipAddress, result.familyAddress);
    }
  } catch (err) {
    callback(err);
  }
}
