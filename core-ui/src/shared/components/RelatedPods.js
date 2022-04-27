import React from 'react';
import { PodList } from 'resources/Pods/PodList';
import { useTranslation } from 'react-i18next';

export const RelatedPods = ({ namespace = '', filter, labelSelector }) => {
  const { i18n } = useTranslation();
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods`,
    apiPath: '/api/v1',
    resourceType: 'pods',
    namespace,
    isCompact: true,
    filter,
    showTitle: true,
    i18n,
    labelSelector,
  };

  return <PodList {...podListParams} />;
};
