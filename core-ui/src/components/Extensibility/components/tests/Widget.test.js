import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { mount } from 'enzyme';
import { Widget } from '../Widget';

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

jest.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return query => {
      const jsonataResponse = query === 'false' ? false : query;
      const jsonataError = query === 'error' ? 'Error!' : null;
      return [jsonataResponse, jsonataError];
    };
  },
}));

describe('Widget', () => {
  describe('structure.visible', () => {
    it('not set -> render component as usual', () => {
      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget value="test-value" structure={{ source: 'child-value' }} />
        </DataSourcesContextProvider>,
      );

      expect(container.text()).toBe('child-value');
    });

    it('falsy (but not boolean "false") -> render component as usual', () => {
      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ source: '', visibility: null }}
          />
        </DataSourcesContextProvider>,
      );

      setTimeout(() => expect(container.text()).toBe('test-value'));
    });

    it('Explicitly false -> hide component', () => {
      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ source: '', visibility: false }}
          />
        </DataSourcesContextProvider>,
      );

      expect(container.isEmptyRender()).toBe(true);
    });

    it('jsonata error -> display error', () => {
      console.warn = jest.fn();

      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ source: '', visibility: 'error' }}
          />
        </DataSourcesContextProvider>,
      );
      expect(container.text()).toBe('extensibility.configuration-error');
    });

    it('jsonata -> control visibility', () => {
      const container1 = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ source: '', visibility: '$contains(data, "test")' }}
          />
        </DataSourcesContextProvider>,
      );
      const container2 = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ source: '', visibility: '$contains(data, "tets")' }}
          />
        </DataSourcesContextProvider>,
      );

      setTimeout(() => {
        expect(container1.text()).toBe('test-value');
        expect(container2.isEmptyRender()).toBe(true);
      });
    });
  });
});
