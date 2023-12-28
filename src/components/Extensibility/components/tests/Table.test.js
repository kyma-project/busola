import { TranslationBundleContext } from 'components/Extensibility/helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { mount } from 'testing/enzymeUtils';
import { act, render, waitFor } from 'testing/reactTestingUtils';
import { Table } from '../Table';
import { ThemeProvider } from '@ui5/webcomponents-react';

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);
jest.mock('components/Extensibility/ExtensibilityWizard', () => null);

const genericNotFoundMessage = 'components.generic-list.messages.not-found';
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
        const component = mount(
          <ThemeProvider>
            <Table value={value} structure={{}} />
          </ThemeProvider>,
        );
        await waitFor(async () => {
          await act(async () => {
            const list = component.find(GenericList);
            expect(list).toHaveLength(1);

            const { entries, notFoundMessage } = list.props();
            expect(entries).toMatchObject(value);
            expect(notFoundMessage).toBe(genericNotFoundMessage);
          });
        });
      });

      it('for nullish value defaults to empty array', async () => {
        const component = mount(
          <ThemeProvider>
            <Table value={null} structure={{}} />
          </ThemeProvider>,
        );

        await waitFor(async () => {
          await act(async () => {
            const list = component.find(GenericList);
            expect(list).toHaveLength(1);

            const { entries, notFoundMessage } = list.props();
            expect(entries).toMatchObject([]);
            expect(notFoundMessage).toBe(genericNotFoundMessage);
          });
        });
      });

      it('for invalid value, renders "not-found" message', async () => {
        const component = mount(
          <ThemeProvider>
            <Table value={-3} structure={{}} />
          </ThemeProvider>,
        );
        await waitFor(async () => {
          await act(async () => {
            const list = component.find(GenericList);
            expect(list).toHaveLength(1);

            const { entries, notFoundMessage } = list.props();
            expect(entries).toMatchObject([-3]);
            expect(notFoundMessage).toBe(genericNotFoundMessage);
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

        const component = render(
          <ThemeProvider>
            <Table value={elements} structure={structure} />
          </ThemeProvider>,
        );

        await waitFor(async () => {
          await act(async () => {
            expect(component.findByLabelText('search-input'));
            expect(component.findByText('extensibility::first'));
          });
        });
      });
    });

    // we cannot test Widget underneath the rowRenderer, as jsonpath
    // import is messed up by Jest
    // https://stackoverflow.com/questions/70586995/jest-modules-do-not-import-correctly
    describe('header & row renderer', () => {
      // const value = [{ a: 'b' }, { a: 'c' }];
      // it('passes empty renderers for nullish children', () => {
      //   const component = mount(
      //     <Table value={value} structure={{ children: null }} />,
      //   );
      //   const list = component.find(GenericList);
      //   expect(list).toHaveLength(1);
      //   const { rowRenderer, headerRenderer } = list.props();
      //   expect(rowRenderer()).toBe('');
      // });
      // it('2', () => {
      // const component = mount(
      //   <DataSourcesContextProvider value={{}} dataSources={{}}>
      //     <Table value={value} structure={{ children: [{ path: '$.a' }] }} />
      //   </DataSourcesContextProvider>,
      // );
      // const list = component.find(GenericList);
      // expect(list).toHaveLength(1);
      // const { rowRenderer, headerRenderer } = list.props();
      // expect(rowRenderer()).toHaveLength(1); // one column
      // expect(rowRenderer()[0].props.structure).toMatchObject({ path: '$.a' });
      // });
    });
  });
});
