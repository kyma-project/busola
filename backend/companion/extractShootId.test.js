import { describe, it, expect } from 'vitest';
import { extractShootId } from './extractShootId.js';

describe('extractShootId', () => {
  it('extracts shoot ID from a standard Kyma SKR URL', () => {
    expect(extractShootId('https://api.c-abc123.kyma.example.com')).toBe(
      'c-abc123',
    );
  });

  it('extracts shoot ID with dots in the shoot name', () => {
    expect(extractShootId('https://api.shoot-1.a2.b3.kyma.example.com')).toBe(
      'shoot-1',
    );
  });

  it('extracts shoot ID from a real Kyma SKR URL', () => {
    expect(
      extractShootId('https://api.c-84c5a2e.stage.kyma.ondemand.com'),
    ).toBe('c-84c5a2e');
  });

  it('returns null for an api.* host that is not a Kyma cluster', () => {
    expect(extractShootId('https://api.foo.example.com')).toBeNull();
  });

  it('returns null when the hostname does not start with api', () => {
    expect(extractShootId('https://k8s.example.com')).toBeNull();
  });

  it('returns null when the hostname has only one segment after api', () => {
    expect(extractShootId('https://api.only-one')).toBeNull();
  });

  it('returns null for an invalid URL', () => {
    expect(extractShootId('not-a-url')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractShootId('')).toBeNull();
  });
});
