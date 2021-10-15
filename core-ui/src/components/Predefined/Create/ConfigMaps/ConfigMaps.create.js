import React from 'react';
import { usePost } from 'react-shared';
import { useTranslation } from 'react-i18next';

// import { ConfigMapForm } from 'shared/components/ConfigMap/ConfigMapForm';
import { ConfigMapForm } from './ConfigMapForm';

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
        `${t('common.tooltips.error')} ${e.message}`,
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
