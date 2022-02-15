import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { ComponentForList } from 'shared/getComponents';
import { isEqual } from 'lodash';
import './WorkloadSelector.scss';

export const WorkloadSelector = resource => {
  const { t } = useTranslation();

  const filterByWorkLoadSelectorLabels = pod => {
    if (!resource.spec?.workloadSelector?.labels || !pod.metadata?.labels)
      return false;

    const podLabels = Object.entries(pod.metadata?.labels);

    const workloadSelectorLabels = Object.entries(
      resource.spec?.workloadSelector?.labels,
    );

    return podLabels.some(label =>
      workloadSelectorLabels.some(workload => isEqual(label, workload)),
    );
  };

  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${resource.metadata?.namespace}/pods`,
    resourceType: 'pods',
    namespace: resource.metadata?.namespace,
    isCompact: true,
    showTitle: true,
    filter: filterByWorkLoadSelectorLabels,
  };

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('sidecars.headers.workload-selector')}
          className="header"
        />
        {resource.spec?.workloadSelector?.labels ? (
          <Labels labels={resource.spec?.workloadSelector?.labels} />
        ) : null}
      </LayoutPanel.Header>
      <ComponentForList
        name="podsList"
        params={podListParams}
        key="workload-selector"
      />
    </LayoutPanel>
  );
};
