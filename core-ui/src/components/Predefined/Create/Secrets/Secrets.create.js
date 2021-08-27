import React from 'react';
import { CreateSecretForm } from './CreateSecretForm';

export function SecretsCreate(props) {
  return <CreateSecretForm namespaceId={props.namespace} {...props} />;
}
