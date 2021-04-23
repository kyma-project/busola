import React from 'react';
import { useUpdate } from 'react-shared';
import { createPatch } from 'rfc6902';
import { ConfigMapForm } from '../../../../shared/components/ConfigMap/ConfigMapForm';

export function EditConfigMapForm(props) {
  const patchRequest = useUpdate();
  const { configMap, onCompleted, onError, resourceUrl, ...formProps } = props;

  const onSubmit = async updatedConfigMap => {
    try {
      console.log(resourceUrl);
      console.log(createPatch(configMap, updatedConfigMap));
      await patchRequest(resourceUrl, createPatch(configMap, updatedConfigMap));
      onCompleted('Config Map updated');
    } catch (e) {
      console.warn(e);
      onError('Cannot update Config Map', `Error: ${e.message}`);
    }
  };

  return (
    <ConfigMapForm {...formProps} configMap={configMap} onSubmit={onSubmit} />
  );
}
