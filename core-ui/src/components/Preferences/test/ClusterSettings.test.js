import React from 'react';
import LuigiClient from '@luigi-project/client';
import { render, fireEvent } from '@testing-library/react';
import ClusterSettings from '../ClusterSettings';

jest.mock('react-shared', () => ({
  useMicrofrontendContext: () => ({
    cluster: {
      server: 'test-api-url',
      'certificate-authority-data': 'test-ca',
    },
  }),
}));

describe('ClusterSettings', () => {
  it('Sets input default value', () => {
    const { getByPlaceholderText } = render(<ClusterSettings />);
    expect(getByPlaceholderText('Kubernetes API Url')).toHaveValue(
      'test-api-url',
    );
  });

  it('Sends custom message on button click', () => {
    const url = 'api.url';
    const ca = 'ca';

    const spy = jest.spyOn(LuigiClient, 'sendCustomMessage');
    const { getByPlaceholderText, getByText } = render(<ClusterSettings />);

    fireEvent.change(getByPlaceholderText('Kubernetes API Url'), {
      target: { value: url },
    });
    fireEvent.change(getByPlaceholderText('Certificate authority data'), {
      target: { value: ca },
    });

    fireEvent.click(getByText('Update configuration'));
    expect(spy).toHaveBeenCalledWith({
      id: 'busola.updateClusterParams',
      server: url,
      'certificate-authority-data': ca,
    });

    spy.mockRestore();
  });
});
