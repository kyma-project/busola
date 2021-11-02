import React from 'react';
import { Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { ControlledByKind } from 'react-shared';
import { Link as ReactSharedLink } from 'react-shared';

import { PodStatus } from '../../Details/Pod/PodStatus';
import PodRestarts from './PodRestarts';

export const PodsList = ({ DefaultRenderer, ...otherParams }) => {
  const { showNodeName } = otherParams;
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
    <span>
      <ReactSharedLink
        className="fd-link fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/pods/"
        text="Pod"
      />
      {t('pods.description')}
    </span>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
