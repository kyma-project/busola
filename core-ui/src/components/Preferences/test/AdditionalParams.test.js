import React from 'react';
import LuigiClient from '@luigi-project/client';
import { render, fireEvent } from '@testing-library/react';
import AdditionalSettings from '../AdditionalSettings';

jest.mock('react-shared', () => ({
  useMicrofrontendContext: () => ({ bebEnabled: false }),
}));

describe('AdditionalSettings', () => {
  it.skip('Sends custom message on changing the BEB', () => {
    //aria-label can no more be passed to the input element. Thank you fundamental.
    const spy = jest.spyOn(LuigiClient, 'sendCustomMessage');
    const { getByLabelText, getByText } = render(<AdditionalSettings />);

    fireEvent.click(getByLabelText('beb-enabled'));

    fireEvent.click(getByText('Update configuration'));

    expect(spy).toHaveBeenCalledWith({
      id: 'busola.bebEnabled',
      bebEnabled: true,
    });

    spy.mockRestore();
  });
});
