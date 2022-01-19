import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export const RelatedPods = pvc => {
  const filterByClaim = ({ spec }) =>
    spec?.volumes?.find(
      volume => volume?.persistentVolumeClaim?.claimName === pvc.metadata.name,
    );

  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${pvc.metadata.namespace}/pods`,
    resourceType: 'pods',
    namespace: pvc.metadata.namespace,
    isCompact: true,
    showTitle: true,
    filter: filterByClaim,
  };
  return (
    <ComponentForList name="podsList" params={podListParams} key="pvc-pods" />
  );
};
