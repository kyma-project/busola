import { RelationsContextProvider } from 'components/Extensibility/contexts/RelationsContext';
import { mount } from 'enzyme';
import { Widget } from '../Widget';

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => 'monaco-editor',
}));

describe('Widget', () => {
  describe('structure.visible', () => {
    it('not set -> render component as usual', () => {
      const container = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget value="test-value" structure={{ path: null }} />
        </RelationsContextProvider>,
      );

      expect(container.text()).toBe('test-value');
    });

    it('falsy (but not boolean "false") -> render component as usual', () => {
      const container = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget
            value="test-value"
            structure={{ path: null, visible: null }}
          />
        </RelationsContextProvider>,
      );

      expect(container.text()).toBe('test-value');
    });

    it('Explicitly false -> hide component', () => {
      const container = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget
            value="test-value"
            structure={{ path: null, visible: false }}
          />
        </RelationsContextProvider>,
      );

      expect(container.isEmptyRender()).toBe(true);
    });

    it('jsonata error -> display error', () => {
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      const container = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget
            value="test-value"
            structure={{ path: null, visible: '+=' }}
          />
        </RelationsContextProvider>,
      );

      expect(container.text()).toBe('extensibility.configuration-error');
      expect(console.warn.mock.calls[0][0]).toBe(
        'Widget::shouldBeVisible error:',
      );
      console.warn = originalConsoleWarn;
    });

    it('jsonata -> control visibility', () => {
      const container1 = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget
            value="test-value"
            structure={{ path: null, visible: '$contains(data, "test")' }}
          />
        </RelationsContextProvider>,
      );
      expect(container1.text()).toBe('test-value');

      const container2 = mount(
        <RelationsContextProvider value={{}} relations={{}}>
          <Widget
            value="test-value"
            structure={{ path: null, visible: '$contains(data, "tets")' }}
          />
        </RelationsContextProvider>,
      );
      expect(container2.isEmptyRender()).toBe(true);
    });
  });
});
