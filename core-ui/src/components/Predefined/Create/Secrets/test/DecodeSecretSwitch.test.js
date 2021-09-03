import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DecodeSecretSwitch } from '../DecodeSecretSwitch';

describe('DecodeSecretSwitch', () => {
  it('Encodes data', () => {
    const setEntries = jest.fn();
    const setEncoded = jest.fn();
    const { getByText } = render(
      <DecodeSecretSwitch
        entries={[{ key: 'test-key', value: 'test-value' }]}
        isEncoded={false}
        setEntries={setEntries}
        setEncoded={setEncoded}
      />,
    );

    fireEvent.click(getByText('secrets.buttons.encode'));
    expect(setEntries).toHaveBeenCalledWith([
      { key: 'test-key', value: btoa('test-value') },
    ]);
    expect(setEncoded).toHaveBeenCalledWith(true);
  });

  it('Decodes data', () => {
    const setEntries = jest.fn();
    const setEncoded = jest.fn();
    const { getByText } = render(
      <DecodeSecretSwitch
        entries={[{ key: 'test-key', value: btoa('test-value') }]}
        isEncoded={true}
        setEntries={setEntries}
        setEncoded={setEncoded}
      />,
    );

    fireEvent.click(getByText('secrets.buttons.decode'));
    expect(setEntries).toHaveBeenCalledWith([
      { key: 'test-key', value: 'test-value' },
    ]);
    expect(setEncoded).toHaveBeenCalledWith(false);
  });
});
