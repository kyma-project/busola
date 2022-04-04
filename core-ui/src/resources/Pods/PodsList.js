import React from 'react';
import { Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link as ReactSharedLink } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { PodsCreate } from './PodsCreate';
import { PodStatus } from './PodStatus';
import PodRestarts from './PodRestarts';

const PodsList = params => {
  const { showNodeName } = params;
  const { t } = useTranslation();

  let customColumns = [
    {
      header: t('common.headers.owner'),
      value: pod => {
        return (
          <ControlledByKind ownerReferences={pod.metadata.ownerReferences} />
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
            className="fd-link"
            onClick={() =>
              LuigiClient.linkManager()
                .fromContext('cluster')
                .navigate(`overview/nodes/${pod.spec.nodeName}`)
            }
          >
            {pod.spec.nodeName}
          </Link>
        ),
      },
    ];
  }

  const description = (
    <Trans i18nKey="pods.description">
      <ReactSharedLink
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/pods/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={PodsCreate}
      {...params}
    />
  );
};

export default PodsList;
