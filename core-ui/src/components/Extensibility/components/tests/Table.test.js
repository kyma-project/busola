import { Table } from '../Table';
import { mount } from 'enzyme';
import { TranslationBundleContext } from 'components/Extensibility/helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => 'blah',
}));

const translations = {
  'myResource.path::my-title': 'My Title',
  'myResource.path::resource.array-data': 'Array Data',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str, { defaultValue } = {}) => translations[str] || defaultValue || str,
  }),
}));

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
          <Table value={[]} structure={{ path: 'resource.array-data' }} />
        </TranslationBundleContext.Provider>,
      );
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { title } = list.props();
      expect(title).toBe('Array Data');
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

      const { entries, genericErrorMessage } = list.props();
      expect(entries).toMatchObject(value);
      expect(genericErrorMessage).toBeFalsy();
    });

    it('for nullish value defaults to empty array', () => {
      const component = mount(<Table value={null} structure={{}} />);
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { entries, genericErrorMessage } = list.props();
      expect(entries).toMatchObject([]);
      expect(genericErrorMessage).toBeFalsy();
    });

    it('otherwise renders error', () => {
      const component = mount(<Table value={-3} structure={{}} />);
      const list = component.find(GenericList);
      expect(list).toHaveLength(1);

      const { entries, genericErrorMessage } = list.props();
      expect(entries).toMatchObject([]);
      expect(genericErrorMessage).toBe('extensibility.widgets.table.error');
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
    //   <RelationsContextProvider value={{}} relations={{}}>
    //     <Table value={value} structure={{ children: [{ path: '$.a' }] }} />
    //   </RelationsContextProvider>,
    // );
    // const list = component.find(GenericList);
    // expect(list).toHaveLength(1);
    // const { rowRenderer, headerRenderer } = list.props();
    // expect(rowRenderer()).toHaveLength(1); // one column
    // expect(rowRenderer()[0].props.structure).toMatchObject({ path: '$.a' });
    // });
  });
});
