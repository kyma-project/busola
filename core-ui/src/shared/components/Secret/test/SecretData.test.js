import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SecretData from '../SecretData';

export const secret = {
  data: {
    client_id: btoa('client-id'),
    client_secret: btoa('client-secret'),
  },
};

export const empty_secret = {};

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        options: {},
      },
    };
  },
}));

describe('SecretData', () => {
  const expectDecodedState = async ({ findByText, queryByText }) => {
    expect(await findByText(atob(secret.data.client_id))).toBeInTheDocument();
    expect(
      await findByText(atob(secret.data.client_secret)),
    ).toBeInTheDocument();

    expect(queryByText(secret.data.client_id)).not.toBeInTheDocument();
    expect(queryByText(secret.data.client_secret)).not.toBeInTheDocument();
  };

  const expectEncodedState = async ({ findByText, queryByText }) => {
    expect(await findByText(secret.data.client_id)).toBeInTheDocument();
    expect(await findByText(secret.data.client_secret)).toBeInTheDocument();

    expect(queryByText(btoa(secret.data.client_id))).not.toBeInTheDocument();
    expect(
      queryByText(btoa(secret.data.client_secret)),
    ).not.toBeInTheDocument();
  };

  it('Renders header', async () => {
    const { queryByText } = render(<SecretData secret={secret} />);

    expect(queryByText('secrets.data')).toBeInTheDocument();
  });

  it('Decodes and encodes secret values', async () => {
    const { findByText, queryByText } = render(<SecretData secret={secret} />);

    fireEvent.click(await findByText('secrets.buttons.decode'));
    await expectDecodedState({ findByText, queryByText });

    fireEvent.click(await findByText('secrets.buttons.encode'));
    await expectEncodedState({ findByText, queryByText });
  });

  it('Renders secret not found', async () => {
    const { findByText } = render(<SecretData secret={null} />);
    expect(await findByText('Secret not found')).toBeInTheDocument();
  });

  it('Renders empty secret', async () => {
    const { findByText } = render(<SecretData secret={empty_secret} />);
    expect(await findByText('Empty secret')).toBeInTheDocument();
  });
});
