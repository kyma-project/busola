import { describe, it, expect } from 'vitest';
import {
  getGardenServer,
  getGardenStaticToken,
  isGardenOidc,
} from '../getGardenToken';

const tokenKc = {
  clusters: [{ name: 'g', cluster: { server: 'https://g' } }],
  users: [{ name: 'u', user: { token: 'abc' } }],
} as any;
const oidcKc = {
  clusters: [{ name: 'g', cluster: { server: 'https://g' } }],
  users: [
    {
      name: 'u',
      user: { exec: { command: 'kubectl', args: ['oidc-login', 'get-token'] } },
    },
  ],
} as any;

it('reads the garden server', () => {
  expect(getGardenServer(tokenKc)).toBe('https://g');
});
it('reads a static token', () => {
  expect(getGardenStaticToken(tokenKc)).toBe('abc');
});
it('returns null token for an oidc exec user', () => {
  expect(getGardenStaticToken(oidcKc)).toBeNull();
});
it('detects an oidc garden kubeconfig', () => {
  expect(isGardenOidc(oidcKc)).toBe(true);
  expect(isGardenOidc(tokenKc)).toBe(false);
});
