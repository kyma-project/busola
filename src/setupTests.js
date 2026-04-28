/* global afterEach, global, vi */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { act, cleanup } from '@testing-library/react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

Element.prototype.scroll = () => {};

window.ResizeObserver = ResizeObserverPolyfill;

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const sanitizeLogValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/[\r\n\u2028\u2029]+/g, ' ');
  }

  if (value instanceof Error) {
    const sanitizedError = new Error(
      value.message.replace(/[\r\n\u2028\u2029]+/g, ' '),
    );
    sanitizedError.name = value.name;
    if (value.stack) {
      sanitizedError.stack = value.stack.replace(/[\r\n\u2028\u2029]+/g, ' ');
    }
    return sanitizedError;
  }

  return value;
};

const getLogSearchValue = (value) => {
  if (value instanceof Error) {
    return sanitizeLogValue(value.message);
  }

  return sanitizeLogValue(String(value ?? ''));
};

export const ignoreConsoleErrors = (patterns) => {
  console.error = (...data) => {
    for (const d of data) {
      if (patterns.some((pattern) => getLogSearchValue(d).includes(pattern)))
        return;
    }
    originalConsoleError(...data.map(sanitizeLogValue));
  };
};

export const ignoreConsoleWarns = (patterns) => {
  console.warn = (...data) => {
    for (const d of data) {
      if (patterns.some((pattern) => getLogSearchValue(d).includes(pattern)))
        return;
    }
    originalConsoleWarn(...data.map(sanitizeLogValue));
  };
};

// shutup popper error
ignoreConsoleErrors(['2']);

// Mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

global.URL.createObjectURL = vi.fn();

global.wait = async (ms = 0) => {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
};

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

window.postMessage = vi.fn();

vi.mock(
  'shared/components/MonacoEditorESM/hooks/useCreateDiffEditor.ts',
  () => ({
    editorInstance: {},
    divRef: () => ({ current: null }),
  }),
);

// suppress "SyntaxError: Cannot use 'import.meta' outside a module"
vi.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => 'monaco-editor',
}));

// suppress "SyntaxError: Cannot use 'import.meta' outside a module"
vi.mock('hooks/useGetSchema', () => ({}));

vi.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (key) => {
        if (Array.isArray(key)) {
          return key[0];
        }
        return key;
      },
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        options: {},
        exists: () => true,
      },
    };
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});
