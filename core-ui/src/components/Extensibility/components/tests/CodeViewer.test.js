import React from 'react';
import { shallow } from 'enzyme';
import { CodeViewer } from '../CodeViewer';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

jest.mock('../../helpers', () => ({
  useGetTranslation: () => ({
    widgetT: key => key,
  }),
}));

describe('CodeViewer', () => {
  it('Renders CodeViewer component and detects yaml', () => {
    const value = {
      key: 'value',
    };

    const wrapper = shallow(<CodeViewer value={value} />);
    const editor = wrapper.find(ReadonlyEditorPanel);
    const { value: valueProps, editorProps } = editor.props();
    const { language } = editorProps;
    expect(valueProps).toEqual(`key: value\n`);
    expect(language).toEqual('yaml');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component with a predefined language', () => {
    const value = {
      key: 'value',
    };
    const structure = { language: "'json'" };

    const wrapper = shallow(<CodeViewer value={value} structure={structure} />);
    const editor = wrapper.find(ReadonlyEditorPanel);
    const { value: valueProps, editorProps } = editor.props();
    const { language } = editorProps;
    expect(valueProps).toEqual(JSON.stringify(value, null, 2));
    expect(language).toEqual('json');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component without an empty value', () => {
    const value = null;

    const wrapper = shallow(<CodeViewer value={value} />);
    const editor = wrapper.find(ReadonlyEditorPanel);
    const { value: valueProps } = editor.props();
    expect(valueProps).toEqual('');
    expect(editor).toHaveLength(1);
  });
});
