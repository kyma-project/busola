import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const genericListCalls: any[] = [];

vi.mock('shared/components/GenericList/GenericList', () => ({
  GenericList: (props: any) => {
    genericListCalls.push(props);
    return <div data-testid="generic-list-mock" />;
  },
}));

import LimitRangeSpecification from './LimitRangeSpecification';

const buildResource = (limits: any[] | undefined): any => ({
  metadata: { name: 'lr', namespace: 'ns' },
  spec: limits ? { limits } : undefined,
});

describe('LimitRangeSpecification', () => {
  beforeEach(() => {
    genericListCalls.length = 0;
  });

  describe('non-compact (detail) mode', () => {
    it('renders one GenericList per limit entry, with the type as title', () => {
      render(
        <LimitRangeSpecification
          resource={buildResource([
            { type: 'Container', max: { memory: '1Gi' } },
            { type: 'Pod', min: { cpu: '100m' } },
          ])}
        />,
      );

      expect(genericListCalls).toHaveLength(2);
      expect(genericListCalls[0].title).toBe('Container');
      expect(genericListCalls[1].title).toBe('Pod');
    });

    it('flattens multiple resources within one limit type into separate rows', () => {
      render(
        <LimitRangeSpecification
          resource={buildResource([
            {
              type: 'Container',
              min: { cpu: '100m', memory: '64Mi' },
              max: { memory: '1Gi' },
            },
          ])}
        />,
      );

      const entries = genericListCalls[0].entries;
      expect(entries).toHaveLength(2);

      const memoryRow = entries.find((e: any) => e.resource === 'memory');
      const cpuRow = entries.find((e: any) => e.resource === 'cpu');

      expect(memoryRow).toMatchObject({ min: '64Mi', max: '1Gi' });
      expect(cpuRow).toMatchObject({ min: '100m' });
      expect(cpuRow.max).toBeUndefined();
    });

    it('omits the "type" column from the header (type is conveyed by the per-section title)', () => {
      render(
        <LimitRangeSpecification
          resource={buildResource([
            { type: 'Container', max: { memory: '1Gi' } },
          ])}
        />,
      );

      const headers = genericListCalls[0].headerRenderer();
      expect(headers).not.toContain('limit-ranges.headers.type');
      expect(headers).not.toContain(null);
    });

    it('falls back to a placeholder row when spec.limits is missing', () => {
      render(<LimitRangeSpecification resource={buildResource(undefined)} />);

      expect(genericListCalls).toHaveLength(1);
      expect(genericListCalls[0].entries[0].resource).toBe('-');
    });
  });

  describe('compact (in-table-cell) mode', () => {
    it('flattens all (limit type, resource) pairs into a single list', () => {
      render(
        <LimitRangeSpecification
          isCompact
          resource={buildResource([
            { type: 'Container', max: { memory: '1Gi' } },
            { type: 'Pod', min: { cpu: '100m', memory: '64Mi' } },
          ])}
        />,
      );

      expect(genericListCalls).toHaveLength(1);

      const entries = genericListCalls[0].entries;
      expect(entries).toHaveLength(3);
      expect(
        entries.find(
          (e: any) => e.type === 'Container' && e.resource === 'memory',
        ),
      ).toBeDefined();
      expect(
        entries.find((e: any) => e.type === 'Pod' && e.resource === 'cpu'),
      ).toBeDefined();
      expect(
        entries.find((e: any) => e.type === 'Pod' && e.resource === 'memory'),
      ).toBeDefined();
    });

    it('includes the "type" column in the header (type is per-row, not per-card)', () => {
      render(
        <LimitRangeSpecification
          isCompact
          resource={buildResource([
            { type: 'Container', max: { memory: '1Gi' } },
          ])}
        />,
      );

      const headers = genericListCalls[0].headerRenderer();
      expect(headers[0]).toBe('limit-ranges.headers.type');
    });
  });
});
