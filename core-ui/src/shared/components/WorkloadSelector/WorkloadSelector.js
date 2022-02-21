import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { isEqual } from 'lodash';
import './WorkloadSelector.scss';
import { RelatedPods } from '../RelatedPods';

export const WorkloadSelector = ({ resource, labels, title }) => {
  const { t } = useTranslation();

  const filterByWorkLoadSelectorLabels = pod => {
    if (!labels || !pod.metadata?.labels) return false;

    const podLabels = Object.entries(pod.metadata?.labels);

    const workloadSelectorLabels = Object.entries(labels);

    return podLabels.some(label =>
      workloadSelectorLabels.some(workload => isEqual(label, workload)),
    );
  };

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('workload-selector.title')}
          className="header"
        />
        {labels ? <Labels labels={labels} /> : null}
      </LayoutPanel.Header>
      <RelatedPods
        resource={resource}
        filter={filterByWorkLoadSelectorLabels}
      />
    </LayoutPanel>
  );
};
