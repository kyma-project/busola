/* global cy, describe, it */
import React, { useMemo, useState, useEffect } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { generateEntries, type DatasetSize } from './lib/fixtures';
import { measureInteraction, validateSample } from './lib/metrics';
import {
  buildScenarioSummary,
  buildSummary,
  writeSummary,
  type ScenarioSummary,
} from './lib/report';

const COMPONENT = 'GenericList';
const SIZES: DatasetSize[] = ['small', 'medium', 'large'];
const SAMPLES = 5;

// Lightweight stand-in for label chips — adds React component cell complexity
// without UI5 custom elements or i18n hooks that would inflate the DOM at scale.
function LabelChips({ labels }: { labels: Record<string, string> }) {
  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {Object.entries(labels).map(([k, v]) => (
        <span
          key={k}
          style={{ padding: '2px 6px', borderRadius: 4, fontSize: 12 }}
        >
          {k}={v}
        </span>
      ))}
    </span>
  );
}

// 5 columns matching typical resource-list complexity (e.g. Secrets):
// four plain strings + one React component cell (label chips)
const headerRenderer = () => ['Name', 'Namespace', 'Type', 'Created', 'Labels'];
const rowRenderer = (entry: any) => [
  entry.name,
  entry.metadata.namespace,
  entry.type,
  entry.metadata.creationTimestamp,
  <LabelChips key={entry.metadata.uid} labels={entry.metadata.labels} />,
];
const nameSort = (a: any, b: any) => a.name.localeCompare(b.name);

function collectUpdates(
  profilerData: any,
  samples: {
    actualDuration: number;
    baseDuration: number;
    commitCount: number;
  }[],
) {
  const updates = profilerData.filter((d: any) => d.phase === 'update');
  if (updates.length === 0) return;
  samples.push({
    actualDuration: updates.reduce(
      (sum: number, c: any) => sum + c.actualDuration,
      0,
    ),
    baseDuration: updates[updates.length - 1].baseDuration,
    commitCount: updates.length,
  });
}

// Wait for React to commit an update without traversing the DOM.
// cy.get('@profilerData') retrieves the alias reference — no DOM snapshot overhead.
function waitForUpdate() {
  cy.get('@profilerData').should(
    (data: any) =>
      expect(data.some((d: any) => d.phase === 'update')).to.be.true,
  );
}

// Externally filters entries so the interaction avoids shadow-DOM traversal.
// window.__setFilter drives each sample; GenericList re-renders its rows.
function FilterWrapper({
  entries,
  ...props
}: {
  entries: any[];
  headerRenderer: () => string[];
  rowRenderer: (entry: any) => any[];
}) {
  const [filter, setFilter] = useState('');
  const filteredEntries = useMemo(
    () =>
      filter ? entries.filter((e: any) => e.name.includes(filter)) : entries,
    [entries, filter],
  );

  useEffect(() => {
    (window as any).__setFilter = setFilter;
    return () => {
      delete (window as any).__setFilter;
    };
  }, []);

  return (
    <GenericList
      entries={filteredEntries}
      searchSettings={{ showSearchField: false }}
      {...props}
    />
  );
}

// Externally sorts entries so the interaction avoids the sort-modal shadow DOM.
// window.__triggerSort drives each sample; GenericList re-renders its rows.
function SortWrapper({
  entries,
  ...props
}: {
  entries: any[];
  headerRenderer: () => string[];
  rowRenderer: (entry: any) => any[];
}) {
  const [items, setItems] = useState(() => [...entries]);

  useEffect(() => {
    (window as any).__triggerSort = (asc: boolean) =>
      setItems((prev) =>
        [...prev].sort((a, b) => (asc ? nameSort(a, b) : nameSort(b, a))),
      );
    return () => {
      delete (window as any).__triggerSort;
    };
  }, []);

  return (
    <GenericList
      entries={items}
      searchSettings={{ showSearchField: false }}
      {...props}
    />
  );
}

// Wrapper that exposes setEntries via window for polling simulation.
function PollingWrapper({
  initialEntries,
  ...props
}: {
  initialEntries: any[];
  headerRenderer: () => string[];
  rowRenderer: (entry: any) => any[];
}) {
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    (window as any).__setEntries = setEntries;
    return () => {
      delete (window as any).__setEntries;
    };
  }, []);

  return <GenericList entries={entries} {...props} />;
}

describe('GenericList performance', () => {
  const allScenarios: ScenarioSummary[] = [];

  after(() => {
    cy.then(() => {
      const summary = buildSummary(
        COMPONENT,
        { samples: SAMPLES },
        allScenarios,
      );
      writeSummary(summary);
    });
  });

  describe('Mount', () => {
    SIZES.forEach((size) => {
      it(`mounts with ${size} dataset`, () => {
        const entries = generateEntries(size);
        const collected: {
          actualDuration: number;
          baseDuration: number;
          commitCount: number;
        }[] = [];
        const browserDurations: number[] = [];

        Cypress._.times(SAMPLES, (i) => {
          measureInteraction(`mount-${size}-${i}`, () => {
            cy.mountWithProfiler(
              <GenericList
                entries={entries}
                headerRenderer={headerRenderer}
                rowRenderer={rowRenderer}
              />,
            );
          }).then((duration: number) => browserDurations.push(duration));

          cy.get('@profilerData').then((data: any) => {
            const mounts = data.filter((d: any) => d.phase === 'mount');
            if (mounts.length > 0) {
              collected.push({
                actualDuration: mounts.reduce(
                  (sum: number, c: any) => sum + c.actualDuration,
                  0,
                ),
                baseDuration: mounts[mounts.length - 1].baseDuration,
                commitCount: mounts.length,
              });
            }
          });
        });

        cy.then(() => {
          expect(collected.length, 'profiler data must be non-empty').to.be.gt(
            0,
          );
          const samples = collected.map((c, i) => {
            const sample = { ...c, browserDuration: browserDurations[i] ?? 0 };
            validateSample(sample);
            return sample;
          });
          allScenarios.push(buildScenarioSummary('mount', size, samples));
        });
      });
    });
  });

  describe('Filter', () => {
    SIZES.forEach((size) => {
      it(`filters with ${size} dataset`, () => {
        const entries = generateEntries(size);
        const updateSamples: {
          actualDuration: number;
          baseDuration: number;
          commitCount: number;
        }[] = [];
        const browserDurations: number[] = [];

        cy.mountWithProfiler(
          <FilterWrapper
            entries={entries}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
          />,
        );
        cy.window().should('have.property', '__setFilter');

        Cypress._.times(SAMPLES, (i) => {
          cy.get('@profilerData').then((data: any) => data.splice(0));

          measureInteraction(`filter-${size}-${i}`, () => {
            cy.window().then((win) => (win as any).__setFilter('resource-1'));
          }).then((duration: number) => browserDurations.push(duration));

          waitForUpdate();

          cy.get('@profilerData').then((data: any) =>
            collectUpdates(data, updateSamples),
          );

          // Reset for next sample
          cy.get('@profilerData').then((data: any) => data.splice(0));
          cy.window().then((win) => (win as any).__setFilter(''));
          waitForUpdate();
        });

        cy.then(() => {
          expect(
            updateSamples.length,
            'profiler update data must be non-empty',
          ).to.be.gt(0);
          const samples = updateSamples.map((s, i) => ({
            ...s,
            browserDuration: browserDurations[i] ?? 0,
          }));
          samples.forEach(validateSample);
          allScenarios.push(buildScenarioSummary('filter', size, samples));
        });
      });
    });
  });

  describe('Sort', () => {
    SIZES.forEach((size) => {
      it(`sorts with ${size} dataset`, () => {
        const entries = generateEntries(size);
        const updateSamples: {
          actualDuration: number;
          baseDuration: number;
          commitCount: number;
        }[] = [];
        const browserDurations: number[] = [];

        cy.mountWithProfiler(
          <SortWrapper
            entries={entries}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
          />,
        );
        cy.window().should('have.property', '__triggerSort');

        Cypress._.times(SAMPLES, (i) => {
          cy.get('@profilerData').then((data: any) => data.splice(0));

          // Alternate ASC/DESC each sample so each call actually triggers a re-render
          const asc = i % 2 === 0;

          measureInteraction(`sort-${size}-${i}`, () => {
            cy.window().then((win) => (win as any).__triggerSort(asc));
          }).then((duration: number) => browserDurations.push(duration));

          waitForUpdate();

          cy.get('@profilerData').then((data: any) =>
            collectUpdates(data, updateSamples),
          );
        });

        cy.then(() => {
          expect(
            updateSamples.length,
            'profiler update data must be non-empty',
          ).to.be.gt(0);
          const samples = updateSamples.map((s, i) => ({
            ...s,
            browserDuration: browserDurations[i] ?? 0,
          }));
          samples.forEach(validateSample);
          allScenarios.push(buildScenarioSummary('sort', size, samples));
        });
      });
    });
  });

  describe('Pagination', () => {
    // Only medium and large have enough entries to paginate with itemsPerPage=10
    (['medium', 'large'] as DatasetSize[]).forEach((size) => {
      it(`paginates with ${size} dataset`, () => {
        const entries = generateEntries(size);
        const updateSamples: {
          actualDuration: number;
          baseDuration: number;
          commitCount: number;
        }[] = [];
        const browserDurations: number[] = [];

        cy.mountWithProfiler(
          <GenericList
            entries={entries}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            pagination={{ itemsPerPage: 10 }}
          />,
        );

        Cypress._.times(SAMPLES, (i) => {
          cy.get('@profilerData').then((data: any) => data.splice(0));

          measureInteraction(`pagination-${size}-${i}`, () => {
            cy.get('#next-page-link').click({ force: true });
          }).then((duration: number) => browserDurations.push(duration));

          cy.get('@profilerData').then((data: any) =>
            collectUpdates(data, updateSamples),
          );

          // Reset to first page for next sample
          cy.get('#previous-page-link').click({ force: true });
        });

        cy.then(() => {
          expect(
            updateSamples.length,
            'profiler update data must be non-empty',
          ).to.be.gt(0);
          const samples = updateSamples.map((s, i) => ({
            ...s,
            browserDuration: browserDurations[i] ?? 0,
          }));
          samples.forEach(validateSample);
          allScenarios.push(buildScenarioSummary('pagination', size, samples));
        });
      });
    });
  });

  describe('Entry update (polling)', () => {
    SIZES.forEach((size) => {
      it(`updates entries with ${size} dataset`, () => {
        const entriesA = generateEntries(size);
        // Simulate a poll: same size but different data
        const entriesB = generateEntries(size).map((e, i) => ({
          ...e,
          name: `updated-${i}`,
          metadata: { ...e.metadata, name: `updated-${i}` },
        }));

        const updateSamples: {
          actualDuration: number;
          baseDuration: number;
          commitCount: number;
        }[] = [];
        const browserDurations: number[] = [];

        cy.mountWithProfiler(
          <PollingWrapper
            initialEntries={entriesA}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
          />,
        );
        cy.window().should('have.property', '__setEntries');

        Cypress._.times(SAMPLES, (i) => {
          cy.get('@profilerData').then((data: any) => data.splice(0));

          const nextEntries = i % 2 === 0 ? entriesB : entriesA;

          measureInteraction(`entry-update-${size}-${i}`, () => {
            cy.window().then((win) => (win as any).__setEntries(nextEntries));
          }).then((duration: number) => browserDurations.push(duration));

          waitForUpdate();

          cy.get('@profilerData').then((data: any) =>
            collectUpdates(data, updateSamples),
          );
        });

        cy.then(() => {
          expect(
            updateSamples.length,
            'profiler update data must be non-empty',
          ).to.be.gt(0);
          const samples = updateSamples.map((s, i) => ({
            ...s,
            browserDuration: browserDurations[i] ?? 0,
          }));
          samples.forEach(validateSample);
          allScenarios.push(
            buildScenarioSummary('entry-update', size, samples),
          );
        });
      });
    });
  });
});
