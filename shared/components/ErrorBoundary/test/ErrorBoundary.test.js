import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));
const consoleErrorFn = jest
  .spyOn(console, 'error')
  .mockImplementation(() => jest.fn());

describe('Error Boundary', () => {
  afterAll(() => {
    consoleErrorFn.mockRestore();
  });

  it('Renders children', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>hello world</div>
      </ErrorBoundary>,
    );

    expect(getByText('hello world')).toBeInTheDocument();
  });
  const Child = () => {
    throw new Error('test');
  };
  it('Renders error component', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );

    expect(getByText('err-boundary.go-back')).toBeInTheDocument();
  });
});
