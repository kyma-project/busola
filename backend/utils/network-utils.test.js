import { afterEach, describe, expect, it } from 'vitest';
import dns from 'dns/promises';
import {
  PrivateIPUsedError,
  isPrivateIp,
  resolveOrBlockPrivateIpAddress,
} from './network-utils.js';
import { request } from 'node:http';

const internetIPAddress = [{ address: '20.11.11.11', family: 4 }];
const localIpAddress = [{ address: '127.0.0.1', family: 4 }];

describe('DNS Proxy Cache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolveOrBlockPrivateIpAddress returns validated ip address even if the address changes', async () => {
    vi.useFakeTimers({});
    // Each test needs to have unique address to check to not use the same cached values
    const addressToCheck = 'random-internet-addr';

    const mockedLookup = vi
      .spyOn(dns, 'lookup')
      .mockResolvedValueOnce(internetIPAddress);
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(localIpAddress);

    let callbackCalls = 0;
    const callback = (err, ipAddress, familyAddress) => {
      callbackCalls++;
      if (mockedLookup.mock.calls.length === 1) {
        expect(err).toBeNull();
        expect(ipAddress).toBe(internetIPAddress[0].address);
        expect(familyAddress).toBe(internetIPAddress[0].family);
      } else {
        expect(err).toBeInstanceOf(PrivateIPUsedError);
      }
    };

    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);
    // Invalidate the cached ip address
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);

    expect(mockedLookup).toHaveBeenCalledWith(addressToCheck, { all: true });
    expect(mockedLookup).toHaveBeenCalledTimes(2);
    expect(callbackCalls).toBe(3);
  });

  it('resolveOrBlockPrivateIpAddress when opts.all is true, call callback with array', async () => {
    const addressToCheck = 'all-ips.com';
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(internetIPAddress);

    let receivedErr = undefined;
    let receivedAddresses;
    const callback = (err, ipAddresses) => {
      receivedErr = err;
      receivedAddresses = ipAddresses;
    };

    await resolveOrBlockPrivateIpAddress(
      addressToCheck,
      { all: true },
      callback,
    );

    expect(receivedErr).toBeNull();
    expect(receivedAddresses).toEqual(internetIPAddress);
  });

  it('resolveOrBlockPrivateIpAddress when dns.lookup throws error, callback with error', async () => {
    const addressToCheck = 'crashed-internet-addr';
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockedLookup = vi
      .spyOn(dns, 'lookup')
      .mockThrow(new Error('Test Error'));

    let callbackCalled = false;
    const callback = (err) => {
      callbackCalled = true;
      expect(err).toBeInstanceOf(PrivateIPUsedError);
    };

    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);

    expect(mockedLookup).toHaveBeenCalledWith(addressToCheck, { all: true });
    expect(mockedLookup).toHaveBeenCalledTimes(1);
    expect(consoleWarn).toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Test Error'),
    );
    expect(callbackCalled).toBe(true);
  });

  it('does not cache DNS failures, so a valid cluster is unblocked on the next request', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const addressToCheck = 'transient-dns-failure-addr';
    const mockedLookup = vi.spyOn(dns, 'lookup');
    // First lookup fails (transient DNS outage) -> request is blocked...
    mockedLookup.mockRejectedValueOnce(new Error('Transient DNS error'));
    // ...second lookup succeeds with a public IP -> request must be allowed.
    mockedLookup.mockResolvedValueOnce(internetIPAddress);

    let firstErr;
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, (err) => {
      firstErr = err;
    });
    expect(firstErr).toBeInstanceOf(PrivateIPUsedError);

    let secondErr;
    let secondIp;
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, (err, ip) => {
      secondErr = err;
      secondIp = ip;
    });

    // The failure was not cached, so the second request retried DNS and passed.
    expect(secondErr).toBeNull();
    expect(secondIp).toBe(internetIPAddress[0].address);
    expect(mockedLookup).toHaveBeenCalledTimes(2);

    consoleWarn.mockRestore();
  });

  it('The custom DNS lookup logic returns error on real request', async () => {
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(localIpAddress);
    const opts = {
      hostname: 'internal-address.com',
      lookup: resolveOrBlockPrivateIpAddress,
    };

    const err = await new Promise((resolve) => {
      const req = request(opts);
      req.end();

      req.on('error', (err) => {
        resolve(err);
      });
    });

    expect(err).toBeInstanceOf(PrivateIPUsedError);
  });
});

describe('isPrivateIp', () => {
  it('blocks IPv4-mapped IPv6 private addresses', () => {
    expect(isPrivateIp('::ffff:10.0.0.1')).toBe(true);
    expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateIp('::ffff:192.168.1.1')).toBe(true);
    expect(isPrivateIp('::ffff:172.16.0.1')).toBe(true);
  });

  it('allows IPv4-mapped IPv6 public addresses', () => {
    expect(isPrivateIp('::ffff:20.11.11.11')).toBe(false);
  });

  it('blocks the unspecified addresses 0.0.0.0 and ::', () => {
    expect(isPrivateIp('0.0.0.0')).toBe(true);
    expect(isPrivateIp('0.1.2.3')).toBe(true);
    expect(isPrivateIp('::')).toBe(true);
    expect(isPrivateIp('::0')).toBe(true);
  });

  it('blocks noncanonical IPv6 loopback and unspecified forms', () => {
    expect(isPrivateIp('0:0:0:0:0:0:0:1')).toBe(true);
    expect(isPrivateIp('0000:0000:0000:0000:0000:0000:0000:0001')).toBe(true);
    expect(isPrivateIp('::01')).toBe(true);
    expect(isPrivateIp('0:0:0:0:0:0:0:0')).toBe(true);
  });

  it('blocks IPv4 embedded in hex-form and IPv4-compatible IPv6', () => {
    expect(isPrivateIp('::ffff:7f00:1')).toBe(true); // 127.0.0.1 in hex
    expect(isPrivateIp('::127.0.0.1')).toBe(true); // IPv4-compatible loopback
  });

  it('blocks the CGNAT range 100.64.0.0/10', () => {
    expect(isPrivateIp('100.64.0.1')).toBe(true);
    expect(isPrivateIp('100.127.255.255')).toBe(true);
    expect(isPrivateIp('100.63.255.255')).toBe(false);
    expect(isPrivateIp('100.128.0.0')).toBe(false);
  });

  it('allows public addresses near private boundaries', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('172.15.0.1')).toBe(false);
    expect(isPrivateIp('172.32.0.1')).toBe(false);
    expect(isPrivateIp('192.169.0.1')).toBe(false);
    expect(isPrivateIp('2606:4700:4700::1111')).toBe(false);
    expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
  });
});

describe('resolveOrBlockPrivateIpAddress with IPv4-mapped IPv6', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls callback with PrivateIPUsedError when DNS resolves to IPv4-mapped private address', async () => {
    const ipv4MappedPrivate = [{ address: '::ffff:10.0.0.1', family: 6 }];
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(ipv4MappedPrivate);

    let receivedError;
    await resolveOrBlockPrivateIpAddress(
      'attacker-controlled.example.com',
      {},
      (err) => {
        receivedError = err;
      },
    );

    expect(receivedError).toBeInstanceOf(PrivateIPUsedError);
  });
});

describe('resolveOrBlockPrivateIpAddress with dual-stack hosts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A Gardener shoot kube-apiserver fronted by a dual-stack AWS NLB returns
  // both an A (IPv4) and an AAAA (IPv6) record. On an IPv4-only node the IPv6
  // attempt fails with ENETUNREACH, so the resolver must hand the socket BOTH
  // families (IPv4 first) and let it fall back — not collapse to one address.
  it('returns every resolved address (IPv4 first) when opts.all is true', async () => {
    const dualStack = [
      { address: '2600:1f12:4bc:ba05::1', family: 6 },
      { address: '56.136.175.163', family: 4 },
    ];
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(dualStack);

    let receivedErr;
    let receivedAddresses;
    await resolveOrBlockPrivateIpAddress(
      'dual-stack-shoot.example.com',
      { all: true },
      (err, addresses) => {
        receivedErr = err;
        receivedAddresses = addresses;
      },
    );

    expect(receivedErr).toBeNull();
    // Both families must be present so Happy Eyeballs can fall back to IPv4...
    expect(receivedAddresses).toHaveLength(2);
    expect(receivedAddresses).toEqual(expect.arrayContaining(dualStack));
    // ...and IPv4 is tried first so the IPv4-only host connects immediately.
    expect(receivedAddresses[0].family).toBe(4);
  });

  it('prefers the IPv4 address for single-address callers (opts.all falsy)', async () => {
    const dualStack = [
      { address: '56.136.175.163', family: 4 },
      // IPv6 is last — the previous collapse-to-last behavior picked this and
      // became unreachable on the IPv4-only KCP cluster.
      { address: '2600:1f12:4bc:ba05::1', family: 6 },
    ];
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(dualStack);

    let receivedErr;
    let receivedIp;
    let receivedFamily;
    await resolveOrBlockPrivateIpAddress(
      'dual-stack-shoot-single.example.com',
      {},
      (err, ip, family) => {
        receivedErr = err;
        receivedIp = ip;
        receivedFamily = family;
      },
    );

    expect(receivedErr).toBeNull();
    expect(receivedIp).toBe('56.136.175.163');
    expect(receivedFamily).toBe(4);
  });

  it('blocks when ANY address in a dual-stack result is private (DNS-rebinding defense)', async () => {
    const mixed = [
      { address: '56.136.175.163', family: 4 }, // public
      { address: '::ffff:10.0.0.1', family: 6 }, // private (IPv4-mapped)
    ];
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce(mixed);

    let receivedError;
    await resolveOrBlockPrivateIpAddress(
      'rebinding.example.com',
      { all: true },
      (err) => {
        receivedError = err;
      },
    );

    expect(receivedError).toBeInstanceOf(PrivateIPUsedError);
  });
});
