import React from 'react';
import { render } from '@testing-library/react';
import { OAuth2ClientStatus } from '../OAuth2ClientStatus';

describe('PodRestarts', () => {
  it('Shows OK for no error', () => {
    const client = { status: { reconciliationError: {} } };
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('common.statuses.ok');
  });

  it('Shows OK for no status', () => {
    const client = {};
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('common.statuses.ok');
  });

  it('Shows error code for error', () => {
    const client = {
      status: { reconciliationError: { code: 'NOT_OK', description: '' } },
    };
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('common.statuses.not_ok');
  });
});
