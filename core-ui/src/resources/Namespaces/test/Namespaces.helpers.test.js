import {
  formatNamespace,
  formatLimits,
  formatMemoryQuotas,
} from './../helpers.js';

describe('Namespace create helpers', () => {
  describe('formatNamespace', () => {
    it('creates valid namespace input', () => {
      const input = { name: 'test-name', labels: { a: 'b', c: 'd' } };
      expect(formatNamespace(input)).toMatchSnapshot();
    });
  });

  describe('formatLimits', () => {
    it('creates valid limits input', () => {
      const input = {
        namespace: 'test-namespace',
        max: 'test-max',
        default: 'test-default',
        defaultRequest: 'test-default-request',
      };
      expect(formatLimits(input)).toMatchSnapshot();
    });
  });

  describe('formatMemoryQuotas', () => {
    it('creates valid memory quotas input', () => {
      const input = {
        namespace: 'test-namespace',
        limits: 'test-limits',
        requests: 'test-requests',
      };
      expect(formatMemoryQuotas(input)).toMatchSnapshot();
    });
  });
});
