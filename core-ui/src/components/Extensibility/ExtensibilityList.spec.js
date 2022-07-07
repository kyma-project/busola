import React from 'react';
import { render } from '@testing-library/react';
import { ExtensibilityList } from './ExtensibilityList';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

jest.mock('./ExtensibilityCreate', () => ({
  ExtensibilityCreate: data => {
    return JSON.stringify(data);
  },
}));

jest.mock('./useGetCRbyPath', () => ({
  useGetCRbyPath: () => ({
    resource: {
      path: 'myCustomPath',
      kind: 'myCustomKind',
      name: 'My custom name',
    },
    schema: {},
    relations: {},
  }),
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
        {JSON.stringify(data)}
      </>
    );
  },
}));

describe('ExtensibilityList', () => {
  it("Doesn't render for empty data", () => {
    const { getByText } = render(<ExtensibilityList />);
    expect(getByText(new RegExp('myCustomPath', 'i'))).toBeVisible();
  });
});
