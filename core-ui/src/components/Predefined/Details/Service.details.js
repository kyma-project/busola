import React from 'react';
import { getComponentForList } from 'shared/getComponents';

export const ServicesDetails = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Cluster IP',
      value: resource => resource.spec.clusterIP,
    },
    {
      header: 'Ports',
      value: resource => (
        <>
          {resource.spec.ports?.map(p => (
            <span className="fd-counter" key={p.port}>
              {p.port}
            </span>
          ))}
        </>
      ),
    },
  ];

  const ApiRuleList = getComponentForList({
    name: 'apiruleList',
    params: {
      hasDetailsView: true,
      fixedPath: true,
      resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${otherParams.namespace}/apirules`,
      resourceType: 'apirules',
      namespace: otherParams.namespace,
      isCompact: true,
      showTitle: true,
      filter: apirule => apirule.spec.service.name === otherParams.resourceName,
    },
  });
  return (
    <DefaultRenderer customColumns={customColumns} {...otherParams}>
      {ApiRuleList}
    </DefaultRenderer>
  );
};
