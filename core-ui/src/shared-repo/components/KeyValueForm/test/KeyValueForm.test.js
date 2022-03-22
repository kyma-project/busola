import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { KeyValueForm } from '../KeyValueForm';
import * as helpers from '../helpers';
import { waitFor } from '@testing-library/react';

describe('KeyValueForm', () => {
  it('Adds and removes entries, showing proper warnings', () => {
    const setValid = jest.fn();
    const {
      queryAllByRole,
      getAllByLabelText,
      queryByLabelText,
      getByText,
    } = render(
      <KeyValueForm
        data={{ a: 'b' }}
        setData={jest.fn()}
        setValid={setValid}
      />,
    );
    expect(queryAllByRole('row')).toHaveLength(1);

    // add entry
    fireEvent.click(getByText('components.key-value-form.add-entry'));
    expect(queryAllByRole('row')).toHaveLength(2);

    // add entry, expect duplicate key
    fireEvent.click(getByText('components.key-value-form.add-entry'));
    expect(getAllByLabelText('Duplicate key')).toHaveLength(2);
    expect(setValid).toHaveBeenCalledWith(false);

    // remove last entry, no duplicates
    fireEvent.click(getAllByLabelText('Delete entry')[2]);
    expect(queryAllByRole('row')).toHaveLength(2);
    expect(queryByLabelText('Duplicate key')).not.toBeInTheDocument(0);
    expect(setValid).toHaveBeenCalledWith(true);
  });

  it('Fires events on input', () => {
    const setData = jest.fn();
    const { getByPlaceholderText } = render(
      <KeyValueForm data={{ a: 'b' }} setData={setData} setValid={jest.fn()} />,
    );
    fireEvent.change(getByPlaceholderText('components.key-value-form.key'), {
      target: { value: 'c' },
    });
    expect(setData).toHaveBeenCalledWith({ c: 'b' });
    fireEvent.change(getByPlaceholderText('components.key-value-form.value'), {
      target: { value: 'd' },
    });
    expect(setData).toHaveBeenCalledWith({ c: 'd' });
  });

  it('Handles file upload', async () => {
    helpers.readFromFile = () =>
      Promise.resolve({ name: 'file-name', content: 'file-content' });

    const setData = jest.fn();
    const { getByText } = render(
      <KeyValueForm data={{ a: 'b' }} setData={setData} setValid={jest.fn()} />,
    );

    fireEvent.click(getByText('components.key-value-form.read-value'));

    await waitFor(() =>
      expect(setData).toHaveBeenLastCalledWith({
        'file-name': 'file-content',
      }),
    );
  });
});
