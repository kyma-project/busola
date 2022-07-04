import React from 'react';
import { render } from '@testing-library/react';
import { OAuth2ClientStatus } from '../OAuth2ClientStatus';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));
describe('PodRestarts', () => {
  it('Shows OK for no error', () => {
    const client = { status: { reconciliationError: {} } };
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('ok');
  });

  it('Shows OK for no status', () => {
    const client = {};
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('ok');
  });

  it('Shows error code for error', () => {
    const client = {
      status: { reconciliationError: { code: 'NOT_OK', description: '' } },
    };
    const { queryByRole } = render(<OAuth2ClientStatus client={client} />);
    expect(queryByRole('status')).toHaveTextContent('NOT_OK');
  });
});
