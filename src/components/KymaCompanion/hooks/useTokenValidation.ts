import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { encodingForModel, TiktokenModel } from 'js-tiktoken';

const WARNING_THRESHOLD = 0.8;
const DEBOUNCE_DELAY = 500;
// Fallback values should config not be available
const FALLBACK_MAX_TOKENS = 8000;
const FALLBACK_MODEL: TiktokenModel = 'gpt-4';

interface CompanionConfig {
  model: string;
  queryMaxTokens: number;
}

interface TokenValidationState {
  isTokenLimitExceeded: boolean;
  showTokenWarning: boolean;
  tokenError: boolean;
  tokenCount: number;
}

export const useTokenValidation = (
  text: string,
  config: CompanionConfig,
): TokenValidationState & {
  validateTokenCount: (inputText: string) => { isValid: boolean };
  maxTokens: number;
} => {
  const maxTokens = config?.queryMaxTokens ?? FALLBACK_MAX_TOKENS;
  const model = (config?.model as TiktokenModel) ?? FALLBACK_MODEL;

  const [state, setState] = useState<TokenValidationState>({
    isTokenLimitExceeded: false,
    showTokenWarning: false,
    tokenError: false,
    tokenCount: 0,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const encoding = useMemo(() => encodingForModel(model), [model]);

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
          isValid: count <= maxTokens,
        };
      } catch (err) {
        console.error('Tokenization failed', err);
        return {
          isValid: false,
        };
      }
    },
    [getTokenCount, maxTokens],
  );

  const updateTokenState = useCallback(
    (count: number) => {
      const isExceeded = count > maxTokens;
      const showWarning = !isExceeded && count > maxTokens * WARNING_THRESHOLD;

      setState({
        isTokenLimitExceeded: isExceeded,
        showTokenWarning: showWarning,
        tokenError: false,
        tokenCount: count,
      });
    },
    [maxTokens],
  );

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
          setState((prev) => ({
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
    maxTokens,
  };
};
