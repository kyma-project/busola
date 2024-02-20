import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useUrl } from 'hooks/useUrl';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import { PodCreate } from './PodCreate';
import { calculatePodState, PodStatus } from './PodStatus';
import PodRestarts from './PodRestarts';
import { description } from './PodDescription';

export function PodList(params) {
  const { showNodeName } = params;
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  let customColumns = [
    {
      header: t('common.headers.owner'),
      value: pod => {
        return (
          <ControlledBy
            ownerReferences={pod.metadata.ownerReferences}
            kindOnly
          />
        );
      },
    },
    {
      header: t('common.headers.status'),
      value: pod => <PodStatus pod={pod} />,
    },
    {
      header: t('pods.restarts'),
      value: pod => <PodRestarts statuses={pod.status.containerStatuses} />,
    },
  ];

  if (showNodeName) {
    customColumns = [
      ...customColumns,
      {
        header: t('pods.node'),
        value: pod => (
          <Link
            className="bsl-link"
            to={clusterUrl(`overview/nodes/${pod.spec.nodeName}`)}
          >
            {pod.spec.nodeName}
          </Link>
        ),
      },
    ];
  }

  return (
    <ResourcesList
      disableMargin={params.disableMargin}
      customColumns={customColumns}
      description={description}
      sortBy={defaultSort => ({
        ...defaultSort,
        status: (a, b) =>
          calculatePodState(a).status.localeCompare(
            calculatePodState(b).status,
          ),
      })}
      {...params}
      createResourceForm={PodCreate}
      emptyListProps={{
        subtitleText: t('pods.description'),
        url: 'https://kubernetes.io/docs/concepts/workloads/pods/',
      }}
    />
  );
}

export default PodList;
