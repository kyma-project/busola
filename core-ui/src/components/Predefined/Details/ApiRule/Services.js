import React from 'react';

import { ComponentForList } from 'shared/getComponents';

export const ApiRuleServices = apiRule => {
  const namespace = apiRule.metadata.namespace;
  const url = `/apis/networking.istio.io/v1beta1/namespaces/${namespace}/virtualservices`;

  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'APIRule' && ref.name === apiRule.metadata.name,
    );

  return (
    <ComponentForList
      name="serviceList"
      key="api-rule-services"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: url,
        resourceType: 'VirtualServices',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterByOwnerRef,
      }}
    />
  );
};
