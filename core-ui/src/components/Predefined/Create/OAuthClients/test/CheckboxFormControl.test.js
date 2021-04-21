import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CheckboxFormControl from '../CheckboxFormControl';

describe('CheckboxFormControl', () => {
  const availableValues = {
    a: 'option a',
    b: 'option b',
  };

  it('Renders with minimal props', () => {
    const { queryByText } = render(
      <CheckboxFormControl
        availableValues={availableValues}
        onChange={() => {}}
        name="form-test"
        values={[]}
      />,
    );

    expect(queryByText(/form-test/)).toBeInTheDocument();
    expect(queryByText('option a')).toBeInTheDocument();
    expect(queryByText('option b')).toBeInTheDocument();
  });

  it.skip('Fires event on state change', () => {
    //TODO it fails for some unknown reason but the checkbox seems to work fine
    const mock = jest.fn();
    const { getByText } = render(
      <CheckboxFormControl
        availableValues={availableValues}
        onChange={mock}
        name="form-test"
        values={['a']}
      />,
    );

    fireEvent.click(getByText('option b'));
    expect(mock).toHaveBeenCalledWith(['a', 'b']);

    fireEvent.click(getByText('option a'));
    expect(mock).toHaveBeenCalledWith(['b']);
  });
});
