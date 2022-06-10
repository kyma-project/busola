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

Enzyme.configure({ adapter: new Adapter() });

export async function expectToSolveWithin(
  fnToCheck,
  maxTimeout,
  checkInterval = 100,
) {
  // tries to execute `fnToCheck` function without errors every `checkInteval` milliseconds.
  // If it doesn't succeeed untill `maxTimeout` milliseconds, it fails.

  // This function must be wrapped inside act() like following:
  // await act(async ()=>{ await expectToSolveWithin(...); });

  let getError = () => '';

  const timeoutPromise = new Promise((resolve, reject) =>
    setTimeout(function() {
      console.error('Assertion timeout exceeded');
      reject(getError());
    }, maxTimeout),
  );
  const expectAssertionsPromise = new Promise(async (resolve, reject) =>
    setInterval(() => {
      try {
        fnToCheck();
        resolve();
      } catch (e) {
        //
        //  error = e;
        getError = () => e;
      }
    }, checkInterval),
  );
  return Promise.race([timeoutPromise, expectAssertionsPromise]);
}
