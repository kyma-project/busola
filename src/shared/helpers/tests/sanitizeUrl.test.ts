import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../sanitizeUrl';

describe('sanitizeUrl', () => {
  it('allows https:// URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('https://example.com/path?q=1')).toBe(
      'https://example.com/path?q=1',
    );
  });

  it('allows http:// URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('blocks javascript: scheme', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('');
  });

  it('blocks data: scheme', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe('');
  });

  it('blocks vbscript: scheme', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  it('returns empty string for empty/null/undefined input', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
  });

  it('trims leading/trailing whitespace before checking', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    expect(sanitizeUrl('  javascript:alert(1)  ')).toBe('');
  });
});
