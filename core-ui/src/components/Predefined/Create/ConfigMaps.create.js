import React from 'react';
import { usePost } from 'react-shared';
import { ConfigMapForm } from '../../../shared/components/ConfigMap/ConfigMapForm';

export const ConfigMapsCreate = props => {
  const postRequest = usePost();
  const {
    onCompleted,
    onError,
    resourceUrl,
    refetchList,
    ...formProps
  } = props;
  const initialConfigMap = {
    metadata: {},
  };

  const onSubmit = async configMapInput => {
    try {
      await postRequest(resourceUrl, configMapInput);
      onCompleted('Config Map created');
      refetchList();
    } catch (e) {
      console.warn(e);
      onError('Cannot create Config Map', `Error: ${e.message}`);
    }
  };

  return (
    <ConfigMapForm
      {...formProps}
      configMap={initialConfigMap}
      onSubmit={onSubmit}
    />
  );
};
