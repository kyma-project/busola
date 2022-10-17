import { fireEvent, render } from '@testing-library/react';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { TranslationBundleContext } from 'components/Extensibility/helpers';
import { mount } from 'enzyme';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Table } from '../Table';

const genericNotFoundMessage = 'components.generic-list.messages.not-found';

jest.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return structure => [structure];
  },
}));

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

// use `mount` instead of `shallow` as the latter doesn't work with contexts
describe('Table', () => {
  // tests creating the title based on name & path
  describe('title', () => {
    it('From name, translated', () => {
      const component = mount(
        <TranslationBundleContext.Provider
          value={{ translationBundle: 'myResource.path' }}
        >
          <Table
            value={[]}
            structure={{ path: 'resource.array-data', name: 'my-title' }}
          />
        </TranslationBundleContext.Provider>,
      );
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { title } = list.props();
      expect(title).toBe('My Title');
    });

    it('No name, fall back to path, translated', () => {
      const component = mount(
        <TranslationBundleContext.Provider
          value={{ translationBundle: 'myResource.path' }}
        >
          <Table value={[]} structure={{ source: 'resource.array-data' }} />
        </TranslationBundleContext.Provider>,
      );
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { title } = list.props();
      expect(title).toBe('resource.array-data');
    });

    it('No translated name or path, fall back to non-translated name', () => {
      const component = mount(
        <TranslationBundleContext.Provider
          value={{ translationBundle: 'myResource.path' }}
        >
          <Table value={[]} structure={{ path: 'nope', name: 'blah' }} />
        </TranslationBundleContext.Provider>,
      );

      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { title } = list.props();
      expect(title).toBe('blah');
    });
  });

  // tests "value-to-entries" edge cases
  describe('entries', () => {
    it('passes array as entries', () => {
      const value = ['a'];
      const component = mount(<Table value={value} structure={{}} />);
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { entries, notFoundMessage } = list.props();
      expect(entries).toMatchObject(value);
      expect(notFoundMessage).toBe(genericNotFoundMessage);
    });

    it('for nullish value defaults to empty array', () => {
      const component = mount(<Table value={null} structure={{}} />);
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { entries, notFoundMessage } = list.props();
      expect(entries).toMatchObject([]);
      expect(notFoundMessage).toBe(genericNotFoundMessage);
    });

    it('otherwise renders error', () => {
      const component = mount(<Table value={-3} structure={{}} />);
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { entries, notFoundMessage } = list.props();
      expect(entries).toMatchObject([]);
      expect(notFoundMessage).toBe('extensibility.widgets.table.error');
    });
  });

  describe('searching', () => {
    it('Renders Table without a search input', () => {
      const structure = {
        children: [],
      };

      const component = render(<Table value={null} structure={structure} />);
      const searchInput = component.queryByLabelText('search-input');
      expect(searchInput).toBeNull();
    });

    it('Renders Table with a search input', () => {
      const structure = {
        children: [{ source: 'test', search: true }],
      };

      const component = render(<Table value={[]} structure={structure} />);
      const searchInput = component.queryByLabelText('search-input');
      expect(searchInput).toBeInTheDocument();
    });

    it('Should search for simple data', async () => {
      const structure = {
        children: [{ source: '$item.test', search: true }],
      };
      const listData = [{ test: 'temp' }, { test: 'buf' }];

      const { findByText, getByLabelText, findAllByRole, queryByText } = render(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Table value={listData} structure={structure} />
        </DataSourcesContextProvider>,
      );

      // expect unfiltered results to exist
      await findByText('temp');
      await findByText('buf');

      const searchInput = getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: 'tem' } });

      //there are two items with role='row', the header and the table's row
      const rows = await findAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows.at(1)).toHaveTextContent('temp');
      expect(queryByText('buf')).not.toBeInTheDocument();
    });

    fit('Should search for complex data with a predefined function', async () => {
      const structure = {
        children: [
          {
            source: '$item.test',
            search: {
              searchFunction:
                '$filter($item.test, function($e){$contains($e, $input)})',
            },
          },
        ],
      };
      const listData = [{ test: ['aa'] }, { test: ['cc'] }];

      const {
        findAllByText,
        getByLabelText,
        findAllByRole,
        queryByText,
      } = render(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Table value={listData} structure={structure} arrayItems={listData} />
        </DataSourcesContextProvider>,
      );
      await findAllByText('$item.test');

      const searchInput = getByLabelText('search-input');
      await fireEvent.change(searchInput, { target: { value: 'aa' } });

      const rows = await findAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows.at(1)).toHaveTextContent('$item.test');
      expect(queryByText('cc')).not.toBeInTheDocument();
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
