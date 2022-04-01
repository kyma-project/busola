import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useTranslation } from 'react-i18next';

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

const TestBed = ({ children }) => {
  const { i18n } = useTranslation();
  return <ErrorBoundary i18n={i18n}>{children}</ErrorBoundary>;
};

describe('Error Boundary', () => {
  afterAll(() => {
    consoleErrorFn.mockRestore();
  });

  it('Renders children', () => {
    const { getByText } = render(<TestBed>hello world</TestBed>);

    expect(getByText('hello world')).toBeInTheDocument();
  });
  const Child = () => {
    throw new Error('test');
  };
  it('Renders error component', () => {
    const { getByText } = render(
      <TestBed>
        <Child />
      </TestBed>,
    );

    expect(getByText('err-boundary.go-back')).toBeInTheDocument();
  });
});
