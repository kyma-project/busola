import React from 'react';

import { CreateSecretForm } from './CreateSecretForm';

function SecretsCreate(props) {
  return <CreateSecretForm namespaceId={props.namespace} {...props} />;
}
SecretsCreate.secrets = (t, context) => [
  {
    type: 'kubernetes.io/service-account-token',
    data: ['ca.crt', 'namespace', 'token'],
  },
  {
    type: 'kubernetes.io/dockercfg',
  },
  {
    type: 'kubernetes.io/dockerconfigjson',
    data: [
      '.dockerconfigjson',
      'isInternal',
      'password',
      'registryAddress',
      'serverAddress',
      'username',
    ],
  },
  {
    type: 'kubernetes.io/basic-auth',
  },
  {
    type: 'kubernetes.io/ssh-auth',
  },
  {
    type: 'kubernetes.io/tls',
    data: ['ca.crt', 'tls.crt', 'tls.key'],
  },
  {
    type: 'bootstrap.kubernetes.io/token',
  },
];
export { SecretsCreate };
