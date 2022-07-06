import React from 'react';
import { render } from '@testing-library/react';
import { ExtensibilityList } from './ExtensibilityList';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

jest.mock('./useGetCRbyPath', () => ({
  useGetCRbyPath: () => ({
    resource: {
      path: 'myCustomPath',
    },
  }),
}));

jest.mock('./ExtensibilityListCore', () => ({
  ExtensibilityListCore: data => {
    return JSON.stringify(data);
  },
}));

describe('ExtensibilityList', () => {
  it("Doesn't render for empty data", () => {
    const { getByText } = render(<ExtensibilityList />);
    expect(getByText(new RegExp('myCustomPath', 'i'))).toBeVisible();
  });
});
