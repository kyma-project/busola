import { vi } from 'vitest';

vi.mock('dns/promises', () => ({
  default: {
    lookup: vi.fn(),
  },
}));

import dns from 'dns/promises';
import {
  isPrivateIp,
  isLocalDomain,
  isValidHost,
  isPrivateAddressCached,
} from './utils/network-utils.js';

describe('isPrivateIp', () => {
  const privateIpv4 = [
    ['10.0.0.1', '10.0.0.0/8'],
    ['10.255.255.255', '10.0.0.0/8 upper bound'],
    ['172.16.0.1', '172.16.0.0/12 lower bound'],
    ['172.31.255.255', '172.16.0.0/12 upper bound'],
    ['192.168.0.1', '192.168.0.0/16'],
    ['192.168.255.255', '192.168.0.0/16 upper bound'],
    ['127.0.0.1', 'loopback'],
    ['127.255.255.255', 'loopback upper'],
    ['169.254.0.1', 'link-local'],
    ['169.254.255.255', 'link-local upper'],
  ];

  const publicIpv4 = [
    ['8.8.8.8', 'Google DNS'],
    ['203.0.113.1', 'TEST-NET-3 documentation range'],
    ['172.15.255.255', 'just below 172.16'],
    ['172.32.0.0', 'just above 172.31'],
    ['0.0.0.0', 'unspecified — not covered by private ranges'],
  ];

  const privateIpv6 = [
    ['fc00::1', 'unique local fc'],
    ['fd00::1', 'unique local fd'],
    ['fe80::1', 'link-local'],
    ['::1', 'loopback'],
  ];

  const publicIpv6 = [['2001:db8::1', 'documentation range']];

  test.each(privateIpv4)('%s (%s) is private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  test.each(publicIpv4)('%s (%s) is not private', (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });

  test.each(privateIpv6)('%s (%s) is private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  test.each(publicIpv6)('%s (%s) is not private', (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });
});

describe('isLocalDomain', () => {
  const localHosts = [
    'localhost',
    '127.0.0.1',
    '::1',
    'foo.localhost',
    'bar.local',
    'svc.internal',
    'my.service.internal',
  ];

  const externalHosts = [
    'example.com',
    'api.github.com',
    'kubernetes.default.svc.cluster.external',
  ];

  test.each(localHosts)('%s is a local domain', (hostname) => {
    expect(isLocalDomain(hostname)).toBe(true);
  });

  test.each(externalHosts)('%s is not a local domain', (hostname) => {
    expect(isLocalDomain(hostname)).toBe(false);
  });
});

describe('isValidHost', () => {
  test('bare IP address returns false', () => {
    expect(isValidHost('10.0.0.1')).toBe(false);
  });

  test('IPv6 address returns false', () => {
    expect(isValidHost('::1')).toBe(false);
  });

  test('localhost returns false', () => {
    expect(isValidHost('localhost')).toBe(false);
  });

  test('.local suffix returns false', () => {
    expect(isValidHost('my.service.local')).toBe(false);
  });

  test('valid external hostname returns true', () => {
    expect(isValidHost('api.example.com')).toBe(true);
  });

  test('kubernetes API server hostname returns true', () => {
    expect(isValidHost('my-cluster.api.example.com')).toBe(true);
  });
});

describe('isPrivateAddressCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('hostname resolving to private IP returns true', async () => {
    dns.lookup.mockResolvedValue([{ address: '10.0.0.1', family: 4 }]);
    const result = await isPrivateAddressCached('internal.attacker.com');
    expect(result).toBe(true);
  });

  test('hostname resolving to public IP returns false', async () => {
    dns.lookup.mockResolvedValue([{ address: '203.0.113.5', family: 4 }]);
    const result = await isPrivateAddressCached('public.example.com');
    expect(result).toBe(false);
  });

  test('DNS lookup failure returns true (fail-closed)', async () => {
    dns.lookup.mockRejectedValue(new Error('ENOTFOUND'));
    const result = await isPrivateAddressCached('nonexistent.invalid');
    expect(result).toBe(true);
  });

  test('hostname resolving to multiple IPs: private wins', async () => {
    dns.lookup.mockResolvedValue([
      { address: '203.0.113.5', family: 4 },
      { address: '10.0.0.1', family: 4 },
    ]);
    const result = await isPrivateAddressCached('mixed.example.com');
    expect(result).toBe(true);
  });
});
