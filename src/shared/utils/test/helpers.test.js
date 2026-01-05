import { findCommonPrefix, toSentenceCase } from 'shared/utils/helpers';

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

  describe('toSentenceCase', () => {
    it('Returns falsy values unchanged', () => {
      expect(toSentenceCase(null)).toBe(null);
      expect(toSentenceCase(undefined)).toBe(undefined);
      expect(toSentenceCase('')).toBe('');
    });

    it('Converts lowercase to sentence case', () => {
      expect(toSentenceCase('deployed')).toBe('Deployed');
      expect(toSentenceCase('failed')).toBe('Failed');
      expect(toSentenceCase('running')).toBe('Running');
    });

    it('Converts PascalCase to sentence case', () => {
      expect(toSentenceCase('NotProvisioned')).toBe('Not provisioned');
      expect(toSentenceCase('ContainerCreating')).toBe('Container creating');
      expect(toSentenceCase('PodInitializing')).toBe('Pod initializing');
      expect(toSentenceCase('MemoryPressure')).toBe('Memory pressure');
    });

    it('Converts camelCase to sentence case', () => {
      expect(toSentenceCase('diskPressure')).toBe('Disk pressure');
      expect(toSentenceCase('someStatus')).toBe('Some status');
    });

    it('Keeps already sentence-cased strings unchanged', () => {
      expect(toSentenceCase('Ready')).toBe('Ready');
      expect(toSentenceCase('Pending')).toBe('Pending');
      expect(toSentenceCase('Not installed')).toBe('Not installed');
    });

    it('Handles single word strings', () => {
      expect(toSentenceCase('OK')).toBe('OK'); // All caps stays as-is (no lowercase-uppercase transition)
      expect(toSentenceCase('ok')).toBe('Ok');
      expect(toSentenceCase('A')).toBe('A');
    });
  });
});
