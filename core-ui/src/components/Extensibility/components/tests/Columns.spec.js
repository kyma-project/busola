import React from 'react';
import { render } from '@testing-library/react';
import { Columns } from '../Columns';

jest.mock('../Widget', () => ({
  Widget: data => {
    return data.structure.path;
  },
}));

describe('Columns', () => {
  it('Renders columns', () => {
    const structure = {
      children: [
        {
          name: 'columns.left',
          path: 'spec.value1',
        },
        {
          name: 'columns.right',
          path: 'spec.value2',
        },
      ],
    };

    const { getByText } = render(<Columns structure={structure} />);
    expect(getByText(new RegExp('spec.value1', 'i'))).toBeVisible();
    expect(getByText(new RegExp('spec.value2', 'i'))).toBeVisible();
  });
});
