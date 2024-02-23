import { Labels } from 'shared/components/Labels/Labels';
import { render } from '@testing-library/react';

describe('Labels', () => {
  it('Labels should render with labels', () => {
    const { getByText } = render(
      <Labels labels={{ testLabel: 'testValue' }} />,
    );

    expect(getByText('testLabel=testValue')).toBeInTheDocument();
  });
});
