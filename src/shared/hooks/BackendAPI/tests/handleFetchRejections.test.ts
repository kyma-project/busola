import { describe, it, expect } from 'vitest';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { _test } from '../handleFetchRejections';

const { isBenignFetchRejection } = _test;

describe('isBenignFetchRejection', () => {
  it('treats browser transport failures as benign', () => {
    expect(isBenignFetchRejection(new TypeError('Failed to fetch'))).toBe(true);
    expect(
      isBenignFetchRejection(
        new TypeError('NetworkError when attempting to fetch resource'),
      ),
    ).toBe(true);
    expect(isBenignFetchRejection(new TypeError('Load failed'))).toBe(true);
  });

  it('treats an aborted request as benign', () => {
    expect(
      isBenignFetchRejection(new DOMException('aborted', 'AbortError')),
    ).toBe(true);
  });

  it('lets real HTTP errors surface', () => {
    expect(isBenignFetchRejection(new HttpError('nope', 500, 500))).toBe(false);
  });

  it('lets unrelated errors surface', () => {
    expect(isBenignFetchRejection(new TypeError('x is not a function'))).toBe(
      false,
    );
    expect(isBenignFetchRejection(new Error('Failed to fetch'))).toBe(false);
    expect(isBenignFetchRejection('Failed to fetch')).toBe(false);
    expect(isBenignFetchRejection(undefined)).toBe(false);
  });
});
