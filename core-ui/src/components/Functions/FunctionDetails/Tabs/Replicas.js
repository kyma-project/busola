import React from 'react';
import PodsList from 'components/Predefined/List/Pod/Pods.list';
import { useTranslation } from 'react-i18next';

export default function Replicas({ name, namespace, isActive = false }) {
  const labelSelectors = `serverless.kyma-project.io/function-name=${name},serverless.kyma-project.io/resource=deployment`;
  const { i18n } = useTranslation();
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelectors}`,
    resourceType: 'pods',
    resourceName: 'Replicas of the Function',
    namespace: namespace,
    isCompact: true,
    showTitle: true,
    skipDataLoading: !isActive,
    i18n,
  };
  return <PodsList {...podListParams} />;
}
