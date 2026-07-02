import { expect, it } from 'vitest';
import { encodeBase64Url } from './base64url';

it('produces base64url-safe output without +, / or = characters', () => {
  // '>>>????' base64-encodes to 'Pj4+Pz8/Pw==' which contains all three unsafe chars
  expect(encodeBase64Url('>>>????')).toBe('Pj4-Pz8_Pw');
});
