import React from 'react';
import { Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { PodStatus } from '../../Details/Pod/PodStatus';
import PodRestarts from './PodRestarts';

export const PodsList = ({ DefaultRenderer, ...otherParams }) => {
  const { showNodeName } = otherParams;
  const { t } = useTranslation();

  let customColumns = [
    {
      header: t('common.status'),
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

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
