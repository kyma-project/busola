import React from 'react';

import VirtualServicesList from 'components/Predefined/List/VirtualServices.list';
import { useTranslation } from 'react-i18next';
const ApiRuleServices = apiRule => {
  const namespace = apiRule.metadata.namespace;
  const url = `/apis/networking.istio.io/v1beta1/namespaces/${namespace}/virtualservices`;
  const { i18n } = useTranslation();
  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'APIRule' && ref.name === apiRule.metadata.name,
    );

  return (
    <VirtualServicesList
      key="api-rule-services"
      {...{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: url,
        resourceType: 'virtualservices',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterByOwnerRef,
        i18n,
      }}
    />
  );
};
export default ApiRuleServices;
