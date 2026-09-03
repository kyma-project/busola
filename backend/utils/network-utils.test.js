import { afterEach, describe, expect, it } from 'vitest';
import dns from 'dns/promises';
import {
  PrivateIPUsedError,
  resolveOrBlockPrivateIpAddress,
} from './network-utils';
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
