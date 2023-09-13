import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SecretData from '../SecretData';
import { ThemeProvider } from '@ui5/webcomponents-react';

export const secret = {
  data: {
    client_id: btoa('client-id'),
    client_secret: btoa('client-secret'),
  },
};

export const empty_secret = {};

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
    const { queryByText } = render(
      <ThemeProvider>
        <SecretData secret={secret} />
      </ThemeProvider>,
    );

    expect(queryByText('secrets.data')).toBeInTheDocument();
  });

  it('Decodes and encodes secret values', async () => {
    const { findByText, getAllByText, queryByText } = render(
      <ThemeProvider>
        <SecretData secret={secret} />
      </ThemeProvider>,
    );

    fireEvent.click(await findByText('secrets.buttons.decode'));
    await expectDecodedState({ findByText, queryByText });

    fireEvent.click(await getAllByText('secrets.buttons.encode')[0]);
    await expectEncodedState({ findByText, queryByText });
  });

  it('Renders secret not found', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <SecretData secret={null} />
      </ThemeProvider>,
    );
    expect(await findByText('secrets.secret-not-found')).toBeInTheDocument();
  });

  it('Renders empty secret', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <SecretData secret={empty_secret} />
      </ThemeProvider>,
    );
    expect(await findByText('secrets.secret-empty')).toBeInTheDocument();
  });
});
