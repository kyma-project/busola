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
