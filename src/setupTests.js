import '@testing-library/jest-dom';
import 'babel-polyfill';
import 'jsdom-worker-fix';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { act } from '@testing-library/react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

Element.prototype.scroll = () => {};

window.ResizeObserver = ResizeObserverPolyfill;

const originalConsoleError = console.error;
export const ignoreConsoleErrors = patterns => {
  console.error = (...data) => {
    for (const d of data) {
      if (patterns.some(pattern => d.toString().includes(pattern))) return;
    }
    originalConsoleError(...data);
  };
};
// shutup popper error
ignoreConsoleErrors([
  'Element passed as the argument does not exist in the instance',
  'Error: Could not parse CSS stylesheet',
  'Warning: validateDOMNesting(...): <tr> cannot appear as a child of <ui5-table>.',
  '2',
]);

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
    return new Promise(resolve => {
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

// graphviz-react uses es modules which jest doesn't understand
vi.mock('graphviz-react', () => ({
  Graphviz: () => 'Graphviz mock',
}));

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
      t: key => {
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

Enzyme.configure({ adapter: new Adapter() });
