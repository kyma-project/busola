import React from 'react';
import { usePost } from 'react-shared';
import { ConfigMapForm } from '../../../shared/components/ConfigMap/ConfigMapForm';
import { useTranslation } from 'react-i18next';

export const ConfigMapsCreate = props => {
  const { t } = useTranslation();

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
      onCompleted(t('config-maps.messages.created'));
      refetchList();
    } catch (e) {
      console.warn(e);
      onError(
        t('config-maps.errors.cannot-create'),
        `${t('common.tooltips.error')}:${e.message}`,
      );
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
