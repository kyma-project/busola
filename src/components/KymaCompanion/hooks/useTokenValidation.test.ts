import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTokenValidation } from './useTokenValidation';
import * as tiktoken from 'js-tiktoken';

vi.mock('js-tiktoken', () => ({
  encodingForModel: vi.fn(() => ({
    encode: vi.fn((text: string) => {
      // Simple mock: 1 token per character for predictable testing
      return new Array(text.length).fill(0);
    }),
  })),
}));

describe('useTokenValidation', () => {
  const mockConfig = {
    model: 'gpt-4',
    queryMaxTokens: 100,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should return initial state with empty text', () => {
      const { result } = renderHook(() => useTokenValidation('', mockConfig));

      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(false);
      expect(result.current.tokenError).toBe(false);
      expect(result.current.tokenCount).toBe(0);
      expect(result.current.maxTokens).toBe(100);
    });

    it('should use fallback values when config is not provided', () => {
      const { result } = renderHook(() => useTokenValidation('', {} as any));

      expect(result.current.maxTokens).toBe(8000);
    });

    it('should use fallback values when config is null/undefined', () => {
      const { result } = renderHook(() => useTokenValidation('', null as any));

      expect(result.current.maxTokens).toBe(8000);
    });
  });

  describe('Token counting', () => {
    it('should count tokens correctly for short text', async () => {
      const { result } = renderHook(() =>
        useTokenValidation('hello', mockConfig),
      );

      // Fast-forward past debounce delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(5);
      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(false);
    });

    it('should show warning when approaching token limit', async () => {
      const longText = 'a'.repeat(85);
      const { result } = renderHook(() =>
        useTokenValidation(longText, mockConfig),
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(85);
      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(true);
    });

    it('should indicate token limit exceeded', async () => {
      const veryLongText = 'a'.repeat(150);
      const { result } = renderHook(() =>
        useTokenValidation(veryLongText, mockConfig),
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(150);
      expect(result.current.isTokenLimitExceeded).toBe(true);
      expect(result.current.showTokenWarning).toBe(false);
    });
  });

  describe('Debouncing', () => {
    it('should debounce token calculation', async () => {
      const { result, rerender } = renderHook(
        ({ text }) => useTokenValidation(text, mockConfig),
        { initialProps: { text: 'hello' } },
      );

      // Change text multiple times quickly
      rerender({ text: 'hello world' });
      rerender({ text: 'hello world!!!' });

      // Token count should still be 0 before debounce delay
      expect(result.current.tokenCount).toBe(0);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(14);
    });

    it('should not calculate tokens until debounce delay has passed', async () => {
      const { result } = renderHook(() =>
        useTokenValidation('test', mockConfig),
      );

      // Advance timer but not enough to trigger debounce
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current.tokenCount).toBe(0);

      // Advance to complete debounce
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.tokenCount).toBe(4);
    });
  });

  describe('validateTokenCount function', () => {
    it('should validate token count correctly', () => {
      const { result } = renderHook(() => useTokenValidation('', mockConfig));

      // Valid text (under limit)
      const validResult = result.current.validateTokenCount('short text');
      expect(validResult.isValid).toBe(true);

      // Invalid text (over limit)
      const invalidText = 'a'.repeat(150);
      const invalidResult = result.current.validateTokenCount(invalidText);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should handle tokenization errors in validateTokenCount', () => {
      const spyEncode = vi.spyOn(tiktoken, 'encodingForModel').mockReturnValue({
        encode: vi.fn(() => {
          throw new Error('Mock encoding error');
        }),
        decode: vi.fn(),
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTokenValidation('', mockConfig));
      const validationResult = result.current.validateTokenCount('test');

      expect(validationResult.isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Tokenization failed',
        expect.any(Error),
      );

      expect(spyEncode).toHaveBeenCalledWith(mockConfig.model);
      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle tokenization errors gracefully', async () => {
      vi.spyOn(tiktoken, 'encodingForModel').mockReturnValue({
        encode: vi.fn(() => {
          throw new Error('Mock encoding error');
        }),
        decode: vi.fn(),
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useTokenValidation('test', mockConfig),
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenError).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Tokenization failed',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Text changes', () => {
    it('should update token count when text changes', async () => {
      const { result, rerender } = renderHook(
        ({ text }) => useTokenValidation(text, mockConfig),
        { initialProps: { text: 'hello' } },
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.tokenCount).toBe(5);

      // Change text
      rerender({ text: 'hello world' });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(11);
    });

    it('should reset token count to 0 when text becomes empty', async () => {
      const { result, rerender } = renderHook(
        ({ text }) => useTokenValidation(text, mockConfig),
        { initialProps: { text: 'hello' } },
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(5);

      rerender({ text: '' });

      // Should immediately update to 0 without debounce for empty text
      expect(result.current.tokenCount).toBe(0);
      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(false);
    });
  });

  describe('Config changes', () => {
    it('should update maxTokens when config changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useTokenValidation('test', config),
        { initialProps: { config: mockConfig } },
      );

      expect(result.current.maxTokens).toBe(100);

      const newConfig = { ...mockConfig, queryMaxTokens: 200 };
      rerender({ config: newConfig });

      expect(result.current.maxTokens).toBe(200);
    });
  });

  describe('Warning threshold behavior', () => {
    it('should show warning at exactly 80% threshold', async () => {
      // 80 tokens = exactly 80% of 100
      const text80Percent = 'a'.repeat(80);
      const { result } = renderHook(() =>
        useTokenValidation(text80Percent, mockConfig),
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(80);
      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(false); // Should be false at exactly 80%
    });

    it('should show warning just above 80% threshold', async () => {
      // 81 tokens = just above 80% of 100
      const text81Percent = 'a'.repeat(81);
      const { result } = renderHook(() =>
        useTokenValidation(text81Percent, mockConfig),
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.tokenCount).toBe(81);
      expect(result.current.isTokenLimitExceeded).toBe(false);
      expect(result.current.showTokenWarning).toBe(true);
    });
  });
});
