import React from 'react';
import { render } from '@testing-library/react';
import { AUTH_FORM_OIDC, AuthForm } from '../AuthForm';
import { parseOIDCparams, ClusterConfiguration } from '../ClusterConfiguration';

jest.mock('../AuthForm', () => ({
  AuthForm: jest.fn().mockReturnValue('test2'),
}));

const TWO_USERS_KUBECONFIG = {
  kind: 'Config',
  apiVersion: 'v1',
  clusters: [
    {
      name: 'garden-hasselhoff',
      cluster: {},
    },
  ],
  contexts: [
    {
      context: {
        cluster: 'garden-pamela',
        user: 'pamela-a',
        namespace: 'garden-pamela',
      },
      name: 'garden-pamela',
    },
    {
      context: {
        cluster: 'garden-hasselhoff',
        user: 'david-h',
        namespace: 'garden-hasselhoff',
      },
      name: 'exclusive-david-h-context',
    },
  ],
  'current-context': 'exclusive-david-h-context',
  users: [
    {
      name: 'david-h',
      user: {
        exec: {
          apiVersion: 'client.authentication.k8s.io/v1beta1',
          command: 'kubectl',
          args: [
            'oidc-login',
            'get-token',
            '--oidc-issuer-url=https://coastguard.gov.us',
            '--oidc-client-id=hasselhoff',
            '--oidc-client-secret=otherSecret',
            '--oidc-extra-scope=peach',
            '--oidc-extra-scope=melon',
            '--oidc-extra-scope=plum',
            '--grant-type=auto',
          ],
        },
      },
    },
    {
      name: 'pamela-a',
      user: {
        exec: {
          apiVersion: 'client.authentication.k8s.io/v1beta1',
          command: 'kubectl',
        },
      },
    },
  ],
};

describe('ClusterConfiguration', () => {
  afterEach(() => {
    AuthForm.mockClear();
  });

  it('Renders AuthForm with issuerUrl, clientId and scope with the values from kubeconfig', () => {
    render(
      <ClusterConfiguration
        kubeconfig={TWO_USERS_KUBECONFIG}
        auth={{ type: AUTH_FORM_OIDC }}
      />,
    );
    expect(AuthForm).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: {
          clientId: 'hasselhoff',
          issuerUrl: 'https://coastguard.gov.us',
          scope: 'peach melon plum',
        },
      }),
      expect.anything(),
    );
  });

  it('Renders AuthForm with no issuerUrl, clientId and scope when not provided in kubeconfig', () => {
    render(
      <ClusterConfiguration
        kubeconfig={{
          ...TWO_USERS_KUBECONFIG,
          'current-context': 'garden-pamela',
        }}
        auth={{ type: AUTH_FORM_OIDC }}
      />,
    );
    expect(AuthForm).not.toHaveBeenCalledWith(
      expect.objectContaining({
        auth: {
          clientId: 'hasselhoff',
          issuerUrl: 'https://coastguard.gov.us',
          scope: 'peach melon plum',
        },
      }),
      expect.anything(),
    );
  });

  describe('parseOIDCparams', () => {
    it('Parses params properly', () => {
      const input = {
        exec: {
          args: [
            '--oidc-issuer-url=https://coastguard.gov.us',
            '--oidc-client-id=hasselhoff',
            '--oidc-extra-scope=peach',
          ],
        },
      };
      expect(parseOIDCparams(input)).toMatchObject({
        clientId: 'hasselhoff',
        issuerUrl: 'https://coastguard.gov.us',
        scope: 'peach',
      });
    });

    it('Concatinates params', () => {
      const input = {
        exec: {
          args: [
            '--oidc-extra-scope=peach',
            '--oidc-extra-scope=melon',
            '--oidc-extra-scope=plum',
          ],
        },
      };
      expect(parseOIDCparams(input)).toMatchObject({
        scope: 'peach melon plum',
      });
    });

    it('Ignores not recognized params', () => {
      const input = {
        exec: {
          args: ['--patroling=on-a-jetski'],
        },
      };
      expect(parseOIDCparams(input)).toMatchObject({});
    });
  });
});
