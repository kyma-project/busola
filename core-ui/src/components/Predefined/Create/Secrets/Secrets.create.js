import React from 'react';

import { CreateSecretForm } from './CreateSecretForm';

function SecretsCreate(props) {
  return <CreateSecretForm namespaceId={props.namespace} {...props} />;
}
SecretsCreate.secrets = (t, context) => [
  {
    type: 'kubernetes.io/service-account-token',
    data: [],
  },
  {
    type: 'kubernetes.io/dockercfg',
    data: ['.dockercfg'],
  },
  {
    type: 'kubernetes.io/dockerconfigjson',
    data: ['.dockerconfigjson'],
  },
  {
    type: 'kubernetes.io/basic-auth',
    data: ['username', 'password'],
  },
  {
    type: 'kubernetes.io/ssh-auth',
    data: ['ssh-privatekey'],
  },
  {
    type: 'kubernetes.io/tls',
    data: ['tls.crt', 'tls.key'],
  },
  {
    type: 'bootstrap.kubernetes.io/token',
    data: ['token-id', 'token-secret'],
  },
];
export { SecretsCreate };
