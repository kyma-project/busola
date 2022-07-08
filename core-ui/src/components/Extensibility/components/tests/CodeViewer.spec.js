import React from 'react';
import { shallow } from 'enzyme';
import { CodeViewer } from '../CodeViewer';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => {},
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

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
    const { value: valueProp, editorProps } = wrapper.props();
    const { language } = editorProps;
    expect(valueProp).toEqual(`key: value\n`);
    expect(language).toEqual('yaml');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component with a predefined language', () => {
    const value = {
      key: 'value',
    };
    const structure = { language: 'json' };

    const wrapper = shallow(<CodeViewer value={value} structure={structure} />);
    const editor = wrapper.find(ReadonlyEditorPanel);
    const { value: valueProp, editorProps } = wrapper.props();
    const { language } = editorProps;
    expect(valueProp).toEqual(JSON.stringify(value, null, 2));
    expect(language).toEqual('json');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component with a predefined language', () => {
    const value = null;

    const wrapper = shallow(<CodeViewer value={value} />);
    const editor = wrapper.find(ReadonlyEditorPanel);
    const { value: valueProp, editorProps } = wrapper.props();
    const { language } = editorProps;
    expect(valueProp).toEqual('');
    expect(editor).toHaveLength(1);
  });
});
