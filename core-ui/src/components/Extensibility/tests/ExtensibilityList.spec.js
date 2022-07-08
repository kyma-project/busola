import React from 'react';
import { shallow } from 'enzyme';
import { ExtensibilityList, ExtensibilityListCore } from '../ExtensibilityList';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

const path = 'myCustomPath';
const kind = 'MyCustomResource';
const url = 'mycustomresources';
const translations = {
  name: 'MyResource',
  description: 'This is my resource',
  'spec.customValue1': 'value1',
  'spec.customValue2': 'value2',
};

// those mocks have to start with `mock`
const mockUseGetCRbyPath = jest.fn();
jest.mock('../useGetCRbyPath', () => ({
  useGetCRbyPath: y => mockUseGetCRbyPath(y),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translationKey = key.split('::')[1];
      if (translationKey) return translations[translationKey];
      return key;
    },
  }),
}));

jest.mock('../components/Widget', () => ({
  Widget: data => {
    return JSON.stringify(data);
  },
}));

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => {},
}));

describe('ExtensibilityList', () => {
  it('Renders columns', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: path,
        kind: kind,
      },
    }));

    const wrapper = shallow(<ExtensibilityList />);
    const elc = wrapper.find(ExtensibilityListCore);
    const { resMetaData } = elc.props();
    expect(elc).toHaveLength(1);

    const elcWrapper = shallow(
      <ExtensibilityListCore resMetaData={resMetaData} />,
    );
    const rl = elcWrapper.find(ResourcesList);
    const {
      resourceUrl,
      resourceType,
      resourceName,
      customColumns,
    } = rl.props();
    expect(rl).toHaveLength(1);
    expect(resourceUrl).toEqual(url);
    expect(resourceType).toEqual(path);
    expect(resourceName).toEqual(translations.name);
    expect(customColumns).toEqual([]);
  });

  it('Renders a complex list for more complex data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: path,
        kind: kind,
      },
      list: [{ path: 'spec.customValue1' }, { path: 'spec.customValue2' }],
    }));

    const wrapper = shallow(<ExtensibilityList />);
    const elc = wrapper.find(ExtensibilityListCore);
    const { resMetaData } = elc.props();
    expect(elc).toHaveLength(1);

    const elcWrapper = shallow(
      <ExtensibilityListCore resMetaData={resMetaData} />,
    );
    const rl = elcWrapper.find(ResourcesList);
    const {
      resourceUrl,
      resourceType,
      resourceName,
      customColumns,
    } = rl.props();
    expect(rl).toHaveLength(1);
    expect(resourceUrl).toEqual(url);
    expect(resourceType).toEqual(path);
    expect(resourceName).toEqual(translations.name);
    expect(customColumns?.[0]?.header).toEqual(
      translations['spec.customValue1'],
    );
    expect(customColumns?.[1]?.header).toEqual(
      translations['spec.customValue2'],
    );
  });
});
