import { render, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

import SecretData from '../SecretData';

export const secret = {
  data: {
    client_id: btoa('client-id'),
    client_secret: btoa('client-secret'),
  },
};

export const empty_secret = {};

describe('SecretData', () => {
  const expectInitialState = async ({ getAllByText, queryByText }) => {
    expect(await getAllByText('*****')).toHaveLength(2);

    expect(queryByText(secret.data.client_id)).not.toBeInTheDocument();
    expect(queryByText(secret.data.client_secret)).not.toBeInTheDocument();
    expect(queryByText(btoa(secret.data.client_id))).not.toBeInTheDocument();
    expect(
      queryByText(btoa(secret.data.client_secret)),
    ).not.toBeInTheDocument();
  };

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
    cleanup();
  });

  it('Decodes and encodes secret values', async () => {
    const { findByText, getAllByText, queryByText } = render(
      <ThemeProvider>
        <SecretData secret={secret} />
      </ThemeProvider>,
    );

    await expectInitialState({ getAllByText, queryByText });

    fireEvent.click(getAllByText('secrets.buttons.decode')[0]);
    await expectDecodedState({ findByText, queryByText });

    fireEvent.click(getAllByText('secrets.buttons.encode')[0]);
    await expectEncodedState({ findByText, queryByText });
    cleanup();
  });

  it('Renders secret not found', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <SecretData secret={null} />
      </ThemeProvider>,
    );
    expect(await findByText('secrets.secret-not-found')).toBeInTheDocument();
    cleanup();
  });

  it('Renders empty secret', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <SecretData secret={empty_secret} />
      </ThemeProvider>,
    );
    expect(await findByText('secrets.secret-empty')).toBeInTheDocument();
    cleanup();
  });
});
