import React from 'react';
import { render } from '@testing-library/react';
import { ExtensibilityDetails } from './ExtensibilityDetails';

const resourcePath = 'myCustomPath';
const resourceUrl = 'fakeurl';
const resourceKind = 'MyCustomResource';
const translations = {
  name: 'MyResource',
  'spec.customValue1': 'value1',
  'spec.customValue2': 'value2',
};

// those mocks have to start with `mock`
const mockUseGetCRbyPath = jest.fn();
jest.mock('./useGetCRbyPath', () => ({
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
      resourceUrl,
      resourceType,
      resourceTitle: resourceI18Key,
      resourceName: translations.name,
    };
  },
}));

jest.mock('./components/Widget', () => ({
  Widget: data => {
    return JSON.stringify(data);
  },
}));

jest.mock('./ExtensibilityCreate', () => ({
  ExtensibilityCreate: data => {
    return (
      <>
        <p>Create form for with properties: </p>
        Url: {data.resourceUrl}
      </>
    );
  },
}));

jest.mock('shared/components/ResourceDetails/ResourceDetails', () => ({
  ResourceDetails: data => {
    const CreateForm = data.createResourceForm;
    return (
      <>
        <CreateForm {...data} />
        <p>Details of a resource with properties: </p>
        Name: {data.resourceName}
        Type: {data.resourceType}
        Custom header columns:{' '}
        {data.customColumns?.length
          ? data.customColumns.map(c => {
              return c.header;
            })
          : "doesn't have custom columns"}
      </>
    );
  },
}));

describe('ExtensibilityDetails', () => {
  it('Renders a simple detail for only required data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: resourcePath,
        kind: resourceKind,
      },
    }));
    const { getByText } = render(<ExtensibilityDetails />);
    expect(getByText(new RegExp(resourcePath, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.name, 'i'))).toBeVisible();
    expect(getByText(new RegExp(resourceUrl, 'i'))).toBeVisible();
    expect(
      getByText(new RegExp("doesn't have custom columns", 'i')),
    ).toBeVisible();
  });

  it('Renders a complex detail for more complex data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: resourcePath,
        kind: resourceKind,
      },
      details: {
        header: [{ path: 'spec.customValue1' }, { path: 'spec.customValue2' }],
        body: [{ path: 'spec.customValue3' }],
      },
    }));
    const { getByText } = render(<ExtensibilityDetails />);
    expect(getByText(new RegExp(resourcePath, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.name, 'i'))).toBeVisible();
    expect(getByText(new RegExp(resourceUrl, 'i'))).toBeVisible();
    expect(
      getByText(new RegExp(translations['spec.customValue1'], 'i')),
    ).toBeVisible();
    expect(
      getByText(new RegExp(translations['spec.customValue2'], 'i')),
    ).toBeVisible();
  });
});
