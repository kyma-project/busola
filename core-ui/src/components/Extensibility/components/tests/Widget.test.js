import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { mount } from 'enzyme';
import { Widget } from '../Widget';

jest.mock('components/Extensibility/helpers/useJsonata', () => ({
  useJsonata: () => 'test-value',
}));

describe('Widget', () => {
  describe('structure.visible', () => {
    it('not set -> render component as usual', () => {
      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget value="test-value" structure={{ path: '' }} />
        </DataSourcesContextProvider>,
      );

      expect(container.text()).toBe('test-value');
    });

    it('falsy (but not boolean "false") -> render component as usual', () => {
      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ path: '', visibility: null }}
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
            structure={{ path: '', visibility: false }}
          />
        </DataSourcesContextProvider>,
      );

      expect(container.isEmptyRender()).toBe(true);
    });

    it('jsonata error -> display error', () => {
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      const container = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ path: '', visibility: '+=' }}
          />
        </DataSourcesContextProvider>,
      );

      expect(container.text()).toBe('extensibility.configuration-error');
      expect(console.warn.mock.calls[0][0]).toBe(
        'Widget::shouldBeVisible error:',
      );
      console.warn = originalConsoleWarn;
    });

    it('jsonata -> control visibility', () => {
      const container1 = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ path: '', visibility: '$contains(data, "test")' }}
          />
        </DataSourcesContextProvider>,
      );
      const container2 = mount(
        <DataSourcesContextProvider value={{}} dataSources={{}}>
          <Widget
            value="test-value"
            structure={{ path: '', visibility: '$contains(data, "tets")' }}
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
