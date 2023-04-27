import { useEffect, useState } from 'react';

export function useLoadingDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const handler = setTimeout(() => {
      setDebounced(value);
      setLoading(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debounced, loading };
}
