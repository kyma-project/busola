/* global afterEach, global, vi */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { cleanup, act } from '@testing-library/react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

Element.prototype.scroll = () => {};

window.ResizeObserver = ResizeObserverPolyfill;

// Node 26 adds localStorage/sessionStorage to globalThis as undefined, which causes
// Vitest's populateGlobal to skip them (they're already "in global" but not in its
// hardcoded KEYS list). Re-bridge them from jsdom's window explicitly.
if (typeof localStorage === 'undefined' && global.jsdom) {
  const jsdomWindow = global.jsdom.window;
  Object.defineProperty(global, 'localStorage', {
    get: () => jsdomWindow.localStorage,
    configurable: true,
  });
  Object.defineProperty(global, 'sessionStorage', {
    get: () => jsdomWindow.sessionStorage,
    configurable: true,
  });
}

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
export const ignoreConsoleErrors = (patterns) => {
  console.error = (...data) => {
    for (const d of data) {
      if (patterns.some((pattern) => d.toString().includes(pattern))) return;
    }
    originalConsoleError(...data);
  };
};

export const ignoreConsoleWarns = (patterns) => {
  console.warn = (...data) => {
    for (const d of data) {
      if (patterns.some((pattern) => d.toString().includes(pattern))) return;
    }
    originalConsoleWarn(...data);
  };
};

// shutup popper error
ignoreConsoleErrors(['2']);

// Suppress third-party warnings that are not actionable in tests
ignoreConsoleWarns(['Lit is in dev mode', '[LocaleData]']);

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
