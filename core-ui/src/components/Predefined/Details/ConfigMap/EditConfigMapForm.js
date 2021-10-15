import React from 'react';
import { useUpdate } from 'react-shared';
import { createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';

import { ConfigMapForm } from '../../Create/ConfigMaps/ConfigMapForm';

export function EditConfigMapForm(props) {
  const { t } = useTranslation();

  const patchRequest = useUpdate();
  const { configMap, onCompleted, onError, resourceUrl, ...formProps } = props;

  const onSubmit = async updatedConfigMap => {
    const mergedConfigMap = {
      ...configMap,
      ...updatedConfigMap,
      metadata: { ...configMap.metadata, ...updatedConfigMap.metadata },
    };
    try {
      await patchRequest(resourceUrl, createPatch(configMap, mergedConfigMap));
      onCompleted(t('config-maps.messages.updated'));
    } catch (e) {
      console.warn(e);
      onError(
        t('config-maps.messages.updated'),
        `${t('commons.tooltip.error')} ${e.message}`,
      );
    }
  };

  return (
    <ConfigMapForm {...formProps} configMap={configMap} onSubmit={onSubmit} />
  );
}
