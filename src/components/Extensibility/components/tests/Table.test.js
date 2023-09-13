import { TranslationBundleContext } from 'components/Extensibility/helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { mount } from 'testing/enzymeUtils';
import { fireEvent, render, waitFor } from 'testing/reactTestingUtils';
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
  describe('title', () => {
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

      await component.findByText(/my-title/);
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
        expect(
          await component.queryByText('resource.array-data'),
        ).not.toBeInTheDocument();
      });
    });

    // tests "value-to-entries" edge cases
    describe('entries', () => {
      it('passes array as entries', () => {
        const value = ['a'];
        const component = mount(
          <ThemeProvider>
            <Table value={value} structure={{}} />
          </ThemeProvider>,
        );
        const list = component.find(GenericList);
        expect(list).toHaveLength(1);

        const { entries, notFoundMessage } = list.props();
        expect(entries).toMatchObject(value);
        expect(notFoundMessage).toBe(genericNotFoundMessage);
      });

      it('for nullish value defaults to empty array', () => {
        const component = mount(
          <ThemeProvider>
            <Table value={null} structure={{}} />
          </ThemeProvider>,
        );
        const list = component.find(GenericList);
        expect(list).toHaveLength(1);

        const { entries, notFoundMessage } = list.props();
        expect(entries).toMatchObject([]);
        expect(notFoundMessage).toBe(genericNotFoundMessage);
      });

      it('for invalid value, renders "not-found" message', () => {
        const component = mount(
          <ThemeProvider>
            <Table value={-3} structure={{}} />
          </ThemeProvider>,
        );
        const list = component.find(GenericList);
        expect(list).toHaveLength(1);

        const { entries, notFoundMessage } = list.props();
        expect(entries).toMatchObject([-3]);
        expect(notFoundMessage).toBe(genericNotFoundMessage);
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

        await waitFor(() => {
          expect(queryByLabelText('search-input')).not.toBeInTheDocument();
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

        expect(await component.findByLabelText('search-input'));
        expect(await component.findByText('extensibility::first'));
      });

      it('Should search for simple data', async () => {
        const structure = {
          children: [{ source: '$item.key', search: true }],
        };

        const {
          findByText,
          getAllByLabelText,
          findAllByRole,
          queryByText,
          findAllByLabelText,
        } = render(
          <ThemeProvider>
            <Table value={elements} structure={structure} />
          </ThemeProvider>,
        );

        // expect unfiltered results to exist
        await findByText('extensibility::first');
        await findByText('extensibility::second');
        //expect input to be displayed
        (await findAllByLabelText('search-input'))[0];

        //interact with input
        const searchInput = await getAllByLabelText('search-input')[0];
        fireEvent.change(searchInput, { target: { value: 'firs' } });

        //there are two items with role='row', the header and the table's row
        const rows = await findAllByRole('row');
        expect(rows).toHaveLength(1);
        expect(queryByText('extensibility::first')).toBeInTheDocument();

        expect(queryByText('extensibility::second')).not.toBeInTheDocument();
      });

      it('Should search for complex data with a predefined function', async () => {
        const structure = {
          children: [
            {
              source: '$item.key',
              search: {
                searchFunction:
                  '$filter($item.key, function($e){$contains($e, $input)})',
              },
            },
          ],
        };

        const { findAllByRole, queryByText, getByLabelText } = render(
          <ThemeProvider>
            <Table
              value={elements}
              structure={structure}
              arrayItems={elements}
            />
          </ThemeProvider>,
        );
        // find and interact with search input
        const searchInput = await getByLabelText('search-input');
        fireEvent.change(searchInput, { target: { value: 'fi' } });

        // get Table's rows
        const rows = await findAllByRole('row');
        expect(rows).toHaveLength(1);

        //check whether search input works, 'first' text should be displayed
        expect(queryByText('extensibility::first')).toBeInTheDocument();

        // 'second' text shouldn't be displayed
        expect(queryByText('extensibility::second')).not.toBeInTheDocument();
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
