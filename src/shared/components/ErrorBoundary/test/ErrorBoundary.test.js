import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

const consoleErrorFn = jest
  .spyOn(console, 'error')
  .mockImplementation(() => jest.fn());

const TestBed = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
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
