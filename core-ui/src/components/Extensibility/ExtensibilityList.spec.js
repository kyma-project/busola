import React from 'react';
import { render } from '@testing-library/react';
import { ExtensibilityList } from './ExtensibilityList';

const resourcePath = 'myCustomPath';
const resourceKind = 'MyCustomResource';
const resourceUrl = 'mycustomresources';
const translations = {
  name: 'MyResource',
  description: 'This is my resource',
};

// those mocks have to start with `mock`
const mockLocation = new URL('https://example.com');
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

jest.mock('./components/Widget', () => ({
  Widget: data => {
    return JSON.stringify(data);
  },
}));

jest.mock('shared/components/ResourcesList/ResourcesList', () => ({
  ResourcesList: data => {
    const CreateForm = data.createResourceForm;
    return (
      <>
        <CreateForm {...data} />
        <p>List of resources with properties: </p>
        Name: {data.resourceName}
        Description: {data.description}
        Type: {data.resourceType}
        Custom columns:{' '}
        {data.customColumns?.length
          ? 'has custom columns'
          : "doesn't have custom columns"}
      </>
    );
  },
}));

describe('ExtensibilityList', () => {
  it('Renders a simple list for only required data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: resourcePath,
        kind: resourceKind,
      },
    }));
    const { getByText } = render(<ExtensibilityList />);
    expect(getByText(new RegExp(resourcePath, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.name, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.description, 'i'))).toBeVisible();
    expect(getByText(new RegExp(resourceUrl, 'i'))).toBeVisible();
    expect(
      getByText(new RegExp("doesn't have custom columns", 'i')),
    ).toBeVisible();
  });

  it('Renders a complex list for more complex data', () => {
    mockUseGetCRbyPath.mockImplementationOnce(() => ({
      resource: {
        path: `${resourcePath}?hasDetailsView=true`,
        kind: resourceKind,
      },
      list: [{ path: 'spec.description' }],
    }));
    const { getByText } = render(<ExtensibilityList />);
    expect(getByText(new RegExp(resourcePath, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.name, 'i'))).toBeVisible();
    expect(getByText(new RegExp(translations.description, 'i'))).toBeVisible();
    expect(getByText(new RegExp(resourceUrl, 'i'))).toBeVisible();
    expect(getByText(new RegExp('has custom columns', 'i'))).toBeVisible();
  });
});
