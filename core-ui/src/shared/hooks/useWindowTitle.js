import LuigiClient from '@luigi-project/client';
import { useEffect } from 'react';

export function setWindowTitle(title) {
  setTimeout(() =>
    LuigiClient.sendCustomMessage({ id: 'busola.setWindowTitle', title }),
  );
}

export function useWindowTitle(title, { skip } = {}) {
  useEffect(() => {
    if (!skip) {
      setWindowTitle(title);
    }
  }, [title, skip]);
}

export function WithTitle({ title, children }) {
  useWindowTitle(title);
  return children;
}
