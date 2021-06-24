import React from 'react';
import { render } from '@testing-library/react';
import { AUTH_FORM_OIDC, AuthForm } from '../AuthForm';
import { parseOIDCparams, ClusterConfiguration } from '../ClusterConfiguration';

// const mockAuthForm = jest.fn().mockReturnValue('mocked AuthForm');
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
        cluster: 'garden-hasselhoff',
        user: 'oidc-login',
        namespace: 'garden-hasselhoff',
      },
      name: 'garden-hasselhoff',
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
  'current-context': 'garden-hasselhoff',
  users: [
    {
      name: 'oidc-login',
      user: {
        exec: {
          apiVersion: 'client.authentication.k8s.io/v1beta1',
          command: 'kubectl',
          args: [
            'oidc-login',
            'get-token',
            '--oidc-issuer-url=https://identity.cia.gov',
            '--oidc-client-id=kube-kubectl',
            '--oidc-client-secret=testsecret',
            '--oidc-extra-scope=email',
            '--oidc-extra-scope=profile',
            '--oidc-extra-scope=groups',
            '--grant-type=auto',
          ],
        },
      },
    },
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
            '--oidc-extra-scope=blondies',
            '--oidc-extra-scope=rescue',
            '--oidc-extra-scope=muscles',
            '--grant-type=auto',
          ],
        },
      },
    },
  ],
  preferences: {},
};

describe('ClusterConfiguration', () => {
  beforeEach(() => {});

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
          clientId: 'kube-kubectl',
          issuerUrl: 'https://identity.cia.gov',
          scope: 'email profile groups',
        },
      }),
      expect.anything(),
    );
  });
});
