import React from 'react';
import { useUpdate } from 'react-shared';
import { SecretForm } from '../../Create/Secrets/SecretForm';
import { createPatch } from 'rfc6902';

export function EditSecretForm(props) {
  const patchRequest = useUpdate();
  const { secret, onCompleted, onError, resourceUrl, ...formProps } = props;

  const onSubmit = async secretInput => {
    const mergedSecret = {
      ...secret,
      ...secretInput,
      metadata: { ...secret.metadata, ...secretInput.metadata },
    };
    try {
      await patchRequest(resourceUrl, createPatch(secret, mergedSecret));
      onCompleted('Secret updated');
    } catch (e) {
      console.warn(e);
      onError('Cannot update Secret', `Error: ${e.message}`);
    }
  };

  return <SecretForm {...formProps} secret={secret} onSubmit={onSubmit} />;
}
