import React from 'react';
import { shallow } from 'enzyme';

import {
  ExtensibilityDetails,
  ExtensibilityDetailsCore,
} from '../ExtensibilityDetails';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

const path = 'myCustomPath';
const url = 'fakeurl';
const kind = 'MyCustomResource';
const translations = {
  name: 'MyResource',
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

jest.mock('resources/helpers', () => ({
  usePrepareDetailsProps: (resourceType, resourceI18Key) => {
    return {
      resourceUrl: url,
      resourceType,
      resourceTitle: resourceI18Key,
      resourceName: translations.name,
    };
  },
}));

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => {},
}));

describe('ExtensibilityDetails', () => {
  it('Renders a simple detail for only required data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path,
        kind,
      },
    }));

    const wrapper = shallow(<ExtensibilityDetails />);
    const edc = wrapper.find(ExtensibilityDetailsCore);
    const { resMetaData } = edc.props();
    expect(edc).toHaveLength(1);

    const edcWrapper = shallow(
      <ExtensibilityDetailsCore resMetaData={resMetaData} />,
    );
    const rd = edcWrapper.find(ResourceDetails);
    const {
      resourceUrl,
      resourceType,
      resourceName,
      customColumns,
    } = rd.props();
    expect(rd).toHaveLength(1);
    expect(resourceUrl).toEqual(url);
    expect(resourceType).toEqual(path);
    expect(resourceName).toEqual(translations.name);
    expect(customColumns).toEqual([]);
  });

  it('Renders a complex detail for more complex data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: path,
        kind: kind,
      },
      details: {
        header: [{ path: 'spec.customValue1' }, { path: 'spec.customValue2' }],
        body: [{ path: 'spec.customValue3' }],
      },
    }));

    const wrapper = shallow(<ExtensibilityDetails />);
    const edc = wrapper.find(ExtensibilityDetailsCore);
    const { resMetaData } = edc.props();
    expect(edc).toHaveLength(1);

    const edcWrapper = shallow(
      <ExtensibilityDetailsCore resMetaData={resMetaData} />,
    );
    const rd = edcWrapper.find(ResourceDetails);
    const {
      resourceUrl,
      resourceType,
      resourceName,
      customColumns,
      customComponents,
    } = rd.props();
    expect(rd).toHaveLength(1);
    expect(resourceUrl).toEqual(url);
    expect(resourceType).toEqual(path);
    expect(resourceName).toEqual(translations.name);
    expect(customColumns?.[0]?.header).toEqual(
      translations['spec.customValue1'],
    );
    expect(customColumns?.[1]?.header).toEqual(
      translations['spec.customValue2'],
    );
    expect(customComponents).toHaveLength(1);
  });

  it("Doesn't crash for incorrect data", () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: path,
        kind: kind,
      },
      details: {
        header: 'header',
        body: 'body',
      },
    }));

    const wrapper = shallow(<ExtensibilityDetails />);
    const edc = wrapper.find(ExtensibilityDetailsCore);
    const { resMetaData } = edc.props();
    expect(edc).toHaveLength(1);

    const edcWrapper = shallow(
      <ExtensibilityDetailsCore resMetaData={resMetaData} />,
    );
    const rd = edcWrapper.find(ResourceDetails);
    const {
      resourceUrl,
      resourceType,
      resourceName,
      customColumns,
      customComponents,
    } = rd.props();
    expect(rd).toHaveLength(1);
    expect(resourceUrl).toEqual(url);
    expect(resourceType).toEqual(path);
    expect(resourceName).toEqual(translations.name);
    expect(customColumns).toHaveLength(0);
    expect(customComponents).toHaveLength(0);
  });

  it("Doesn't crash for incomplete data", () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {},
    }));

    const wrapper = shallow(<ExtensibilityDetails />);
    const edc = wrapper.find(ExtensibilityDetailsCore);
    const { resMetaData } = edc.props();
    expect(edc).toHaveLength(1);

    const edcWrapper = shallow(
      <ExtensibilityDetailsCore resMetaData={resMetaData} />,
    );
    const rd = edcWrapper.find(ResourceDetails);
    expect(rd).toHaveLength(1);
  });
});
