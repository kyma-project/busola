import React from 'react';
import PodsListComponent from 'resources/Pods/PodsList';
import { useTranslation } from 'react-i18next';
export const RelatedPods = ({ namespace = '', labelSelector }) => {
  const { i18n } = useTranslation();
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelector}`,
    resourceType: 'pods',
    namespace,
    isCompact: true,
    showTitle: true,
    i18n,
  };

  return <PodsListComponent {...podListParams} />;
};
