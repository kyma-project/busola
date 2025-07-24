import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { encodingForModel } from 'js-tiktoken';

// Token validation constants
const MAX_TOKENS = 100; // Adjust this based on your backend limit
const WARNING_THRESHOLD = 0.9; // Show warning at 90% of limit
const DEFAULT_MODEL = 'gpt-4'; // Default model for tokenization
const DEBOUNCE_DELAY = 300; // Delay in ms for debouncing

interface TokenValidationState {
  isTokenLimitExceeded: boolean;
  showTokenWarning: boolean;
  tokenError: boolean;
}

export const useTokenValidation = (
  text: string,
): TokenValidationState & {
  validateTokenCount: (inputText: string) => { isValid: boolean };
} => {
  const [state, setState] = useState<TokenValidationState>({
    isTokenLimitExceeded: false,
    showTokenWarning: false,
    tokenError: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const encoding = useMemo(() => encodingForModel(DEFAULT_MODEL), []);

  const getTokenCount = useCallback(
    (inputText: string): number => {
      const tokens = encoding.encode(inputText);
      return tokens.length;
    },
    [encoding],
  );

  const validateTokenCount = useCallback(
    (inputText: string): { isValid: boolean } => {
      try {
        const count = getTokenCount(inputText);
        return {
          isValid: count <= MAX_TOKENS,
        };
      } catch (err) {
        console.error('Tokenization failed', err);
        return {
          isValid: false,
        };
      }
    },
    [getTokenCount],
  );

  const updateTokenState = useCallback((count: number) => {
    const isExceeded = count > MAX_TOKENS;
    const showWarning = !isExceeded && count > MAX_TOKENS * WARNING_THRESHOLD;

    setState({
      isTokenLimitExceeded: isExceeded,
      showTokenWarning: showWarning,
      tokenError: false,
    });
  }, []);

  // Debounced token calculation
  useEffect(() => {
    if (text) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        try {
          const count = getTokenCount(text);
          updateTokenState(count);
        } catch (err) {
          console.error('Tokenization failed', err);
          setState(prev => ({
            ...prev,
            tokenError: true,
          }));
        }
      }, DEBOUNCE_DELAY);
    } else {
      updateTokenState(0);
    }
  }, [text, getTokenCount, updateTokenState]);

  return {
    ...state,
    validateTokenCount,
  };
};
