import React from 'react';
import { ComponentForList } from 'shared/getComponents';
import { StatusBadge } from 'react-shared';

export const ReplicasetsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Limits',
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="limits">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                CPU: {c.resources?.limits?.cpu}
                <br />
                Memory: {c.resources?.limits?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
    {
      header: 'Requests',
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="requests">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                CPU: {c.resources?.requests?.cpu}
                <br />
                Memory: {c.resources?.requests?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
    {
      header: 'Ready Replicas',
      value: ({ status: { replicas, readyReplicas } }) => {
        const type = (readyReplicas || 0) < replicas ? 'warning' : 'success';
        const content = `${readyReplicas || 0} / ${replicas}`;
        return (
          <StatusBadge key="replicas" type={type}>
            {content}
          </StatusBadge>
        );
      },
    },
  ];

  const PodsList = (
    <ComponentForList
      name="podsList"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: `/api/v1/namespaces/${otherParams.namespace}/pods`,
        resourceType: 'pods',
        namespace: otherParams.namespace,
        isCompact: true,
        showTitle: true,
        filter: pod =>
          !!pod.metadata.ownerReferences.find(
            ref =>
              ref.kind === 'ReplicaSet' &&
              ref.name === otherParams.resourceName,
          ),
      }}
    />
  );

  return (
    <DefaultRenderer customColumns={customColumns} {...otherParams}>
      {PodsList}
    </DefaultRenderer>
  );
};
