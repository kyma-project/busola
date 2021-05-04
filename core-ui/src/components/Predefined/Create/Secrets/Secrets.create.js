import React from 'react';

import { usePost } from 'react-shared';
import { SecretForm } from './SecretForm';

export function SecretsCreate(props) {
  const postRequest = usePost();
  const {
    onCompleted,
    onError,
    resourceUrl,
    refetchList,
    ...formProps
  } = props;
  const initialSecret = {
    metadata: { labels: {} },
    type: 'Opaque',
    data: {},
  };

  const onSubmit = async secretInput => {
    try {
      await postRequest(resourceUrl, secretInput);
      onCompleted('Secret created');
      refetchList();
    } catch (e) {
      console.warn(e);
      onError('Cannot create secret', `Error: ${e.message}`);
    }
  };

  return (
    <SecretForm {...formProps} secret={initialSecret} onSubmit={onSubmit} />
  );
}
