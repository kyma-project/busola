import { describe, expect, it } from 'vitest';
import dns from 'dns/promises';
import {
  clearCache,
  PrivateIPUsedError,
  resolveOrBlockPrivateIpAddress,
} from './network-utils';

const internetIPAddress = [{ address: '20.11.11.11', family: 4 }];
const localIpAddress = [{ address: '127.0.0.1', family: 4 }];

describe('DNS Proxy Cache', () => {
  it('DNS Proxy cache returns validated ip address', async () => {
    const addressToCheck = 'random-internet-addr';

    const mockedLookup = vi
      .spyOn(dns, 'lookup')
      .mockResolvedValueOnce(internetIPAddress);
    vi.spyOn(dns, 'lookup').mockReturnValueOnce(localIpAddress);

    const callback = (result, ipAddress, familyAddress) => {
      if (mockedLookup.mock.calls.length === 1) {
        expect(result).toBeNull();
        expect(ipAddress).toBe(internetIPAddress[0].address);
        expect(familyAddress).toBe(internetIPAddress[0].family);
      } else {
        expect(result).toBeInstanceOf(PrivateIPUsedError);
      }
    };

    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);
    // TODO: invalidate cache, do it a little bit better
    clearCache();
    await resolveOrBlockPrivateIpAddress(addressToCheck, {}, callback);

    expect(mockedLookup).toHaveBeenCalledWith(addressToCheck, { all: true });
    expect(mockedLookup).toHaveBeenCalledTimes(2);
    mockedLookup.mockRestore();
  });
});
