import { base64Encode, base64Decode } from '../safeBase64';

describe('safeBase64', () => {
  it('Encodes and decodes characters', () => {
    const original = 'ś'; // ordinary btoa will fail

    const encoded = base64Encode(original);
    expect(encoded).toMatchSnapshot();

    expect(base64Decode(encoded)).toEqual(original);
  });
});
