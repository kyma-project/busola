//Do not move this file to another location. It will cause tests to stop working.

import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';

const nodeCrypto = require('crypto');
global.crypto = {
  getRandomValues: function(buffer) {
    return nodeCrypto.randomFillSync(buffer);
  },
};

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

global.URL.createObjectURL = jest.fn();

window.postMessage = jest.fn();

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
