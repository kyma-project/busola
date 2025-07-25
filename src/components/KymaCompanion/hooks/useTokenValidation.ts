import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { encodingForModel } from 'js-tiktoken';

const MAX_TOKENS = 8000;
const DEFAULT_MODEL = 'gpt-4.1';
const WARNING_THRESHOLD = 0.8;
const DEBOUNCE_DELAY = 500;

interface TokenValidationState {
  isTokenLimitExceeded: boolean;
  showTokenWarning: boolean;
  tokenError: boolean;
  tokenCount: number;
}

export const useTokenValidation = (
  text: string,
): TokenValidationState & {
  validateTokenCount: (inputText: string) => { isValid: boolean };
  maxTokens: number;
} => {
  const [state, setState] = useState<TokenValidationState>({
    isTokenLimitExceeded: false,
    showTokenWarning: false,
    tokenError: false,
    tokenCount: 0,
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
      tokenCount: count,
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
    maxTokens: MAX_TOKENS,
  };
};
