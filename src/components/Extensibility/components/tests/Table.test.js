import { TranslationBundleContext } from 'components/Extensibility/helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { act, render, waitFor } from 'testing/reactTestingUtils';
import { Table } from '../Table';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { DataSourcesContextProvider } from '../../contexts/DataSources';

vi.mock('components/Extensibility/ExtensibilityCreate', () => {
  return {
    default: () => ({}),
  };
});
vi.mock('components/Extensibility/ExtensibilityWizard', () => {
  return {
    default: () => ({}),
  };
});

vi.mock('shared/components/GenericList/GenericList', async () => {
  const GenericListMock = (
    await vi.importActual('shared/components/GenericList/GenericList')
  ).GenericList;
  return {
    GenericList: vi.fn(props => <GenericListMock {...props} />),
  };
});

const elements = [
  {
    key: 'first',
  },
  {
    key: 'second',
  },
];

describe('Table', () => {
  // tests creating the title based on name & source
  describe('entries', () => {
    it('From name, translated', async () => {
      const component = render(
        <ThemeProvider>
          <TranslationBundleContext.Provider
            value={{ translationBundle: 'myResource.source' }}
          >
            <Table
              value={elements}
              structure={{
                name: 'my-title',
              }}
            />
          </TranslationBundleContext.Provider>
        </ThemeProvider>,
      );

      await waitFor(async () => {
        await act(async () => {
          component.findByText(/my-title/);
        });
      });
    });

    it('No name, fall back to source, translated', async () => {
      const component = render(
        <ThemeProvider>
          <TranslationBundleContext.Provider
            value={{ translationBundle: 'myResource.source' }}
          >
            <Table value={[]} structure={{ source: 'resource.array-data' }} />
          </TranslationBundleContext.Provider>
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            component.queryByText('resource.array-data'),
          ).not.toBeInTheDocument();
        });
      });
    });

    // tests "value-to-entries" edge cases
    describe('entries', () => {
      it('passes array as entries', async () => {
        const value = ['a'];
        const { container } = render(
          <ThemeProvider>
            <Table value={value} structure={{}} />
          </ThemeProvider>,
        );
        await waitFor(async () => {
          await act(async () => {
            expect(GenericList).toHaveBeenLastCalledWith(
              expect.objectContaining({
                entries: expect.arrayContaining(value),
              }),
              {},
            );

            const list = container.getElementsByTagName('ui5-table');
            expect(list).toHaveLength(1);
          });
        });
      });

      it('for nullish value defaults to empty array', async () => {
        const { container } = render(
          <ThemeProvider>
            <Table value={null} structure={{}} />
          </ThemeProvider>,
        );

        await waitFor(async () => {
          await act(async () => {
            expect(GenericList).toHaveBeenCalledWith(
              expect.objectContaining({
                entries: [],
              }),
              {},
            );
          });

          const list = container.getElementsByTagName('ui5-table');
          expect(list).toHaveLength(1);
        });
      });

      it('for invalid value, renders "not-found" message', async () => {
        const { container } = render(
          <ThemeProvider>
            <Table value={-3} structure={{}} />
          </ThemeProvider>,
        );
        await waitFor(async () => {
          await act(async () => {
            expect(GenericList).toHaveBeenCalledWith(
              expect.objectContaining({
                entries: expect.objectContaining([-3]),
              }),
              {},
            );

            const list = container.getElementsByTagName('ui5-table');
            expect(list).toHaveLength(1);
          });
        });
      });
    });

    describe('searching', () => {
      it('Renders Table without a search input', async () => {
        const structure = {
          children: [],
        };

        const { queryByLabelText } = render(
          <ThemeProvider>
            <Table value={null} structure={structure} />
          </ThemeProvider>,
        );
        await waitFor(async () => {
          await act(async () => {
            expect(queryByLabelText('search-input')).not.toBeInTheDocument();
          });
        });
      });

      it('Renders Table with a search input', async () => {
        const structure = {
          children: [{ source: 'key', search: true }],
        };

        const { queryByLabelText, queryByText } = render(
          <ThemeProvider>
            <Table value={elements} structure={structure} />
          </ThemeProvider>,
        );

        await waitFor(async () => {
          await act(async () => {
            expect(queryByLabelText('search-input'));
            expect(queryByText('extensibility::first'));
          });
        });
      });
    });

    describe('header & row renderer', () => {
      const value = [{ a: 'b' }, { a: 'c' }];
      it('passes empty renderers for nullish children', () => {
        const { container } = render(
          <ThemeProvider>
            <Table value={value} structure={{ children: null }} />
          </ThemeProvider>,
        );

        const genericListCall = GenericList.mock.calls[0][0];
        const rowRenderer = genericListCall.rowRenderer;
        const renderedRows = rowRenderer();
        expect(renderedRows).toHaveLength(0);

        const list = container.getElementsByTagName('ui5-table');
        expect(list).toHaveLength(1);
      });
      it('2', () => {
        const { container } = render(
          <ThemeProvider>
            <DataSourcesContextProvider value={{}} dataSources={{}}>
              <Table
                value={value}
                structure={{ children: [{ path: '$.a' }] }}
              />
            </DataSourcesContextProvider>
          </ThemeProvider>,
        );
        const genericListCall = GenericList.mock.calls[0][0];
        const rowRenderer = genericListCall.rowRenderer;
        const renderedRows = rowRenderer();
        expect(renderedRows).toHaveLength(1);
        expect(renderedRows[0].props.structure).toMatchObject({ path: '$.a' });

        const list = container.getElementsByTagName('ui5-table');
        expect(list).toHaveLength(1);
      });
    });
  });
});
