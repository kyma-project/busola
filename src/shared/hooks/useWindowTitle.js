import { useEffect } from 'react';

export function useWindowTitle(title, { skip } = {}) {
  useEffect(() => {
    const oldTitle = document.title;
    if (!skip) {
      document.title = title;
      return () => (document.title = oldTitle);
    }
  }, [title, skip]);
}

export function WithTitle({ title, children }) {
  useWindowTitle(title);
  return children;
}
