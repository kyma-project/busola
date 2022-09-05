import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'jsdom-worker-fix';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'babel-polyfill';

Element.prototype.scroll = () => {};

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
]);

var nodeCrypto = require('crypto');
global.crypto = {
  getRandomValues: function(buffer) {
    return nodeCrypto.randomFillSync(Buffer.from(buffer));
  },
};
global.URL.createObjectURL = jest.fn();

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

window.postMessage = jest.fn();

// graphviz-react uses es modules which jest doesn't understand
jest.mock('graphviz-react', () => ({
  Graphviz: () => 'Graphviz mock',
}));

// suppress "SyntaxError: Cannot use 'import.meta' outside a module"
jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => 'monaco-editor',
}));

jest.mock('react-i18next', () => ({
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
      },
    };
  },
}));

Enzyme.configure({ adapter: new Adapter() });

// don't use "import" as Luigi needs to be imported after mocking getRandomValues
require('@luigi-project/client').setTargetOrigin('target-origin-for-tests');
