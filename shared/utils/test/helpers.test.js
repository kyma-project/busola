import { findCommonPrefix } from '../helpers';

describe('helpers', () => {
  describe('findCommonPrefix', () => {
    it('Returns initialPrefix for falsy words length', () => {
      expect(findCommonPrefix('i-p', null)).toBe('i-p');
      expect(findCommonPrefix('i-p', [])).toBe('i-p');
    });

    it('Returns initialPrefix for no matches', () => {
      expect(findCommonPrefix('a', ['b', 'c', 'da'])).toBe('a');
    });

    it('Returns entire match', () => {
      expect(findCommonPrefix('abc', ['abcde'])).toBe('abcde');
    });

    it('Returns common prefix for ambiguous case', () => {
      expect(findCommonPrefix('abc', ['abcde1', 'abcde2'])).toBe('abcde');
    });
  });
});
