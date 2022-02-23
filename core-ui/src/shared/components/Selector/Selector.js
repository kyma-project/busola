import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import './Selector.scss';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';

export const Selector = ({ resource, labels, expressions, title }) => {
  const { t } = useTranslation();

  if (!labels || !resource) return null;
  const labelSelector = Object.entries(labels)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');

  console.log(expressions);
  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('workload-selector.title')}
          className="header"
        />
        {labels ? <Labels labels={labels} /> : null}
      </LayoutPanel.Header>
      {expressions ? (
        <MatchExpressionsList expressions={expressions} />
      ) : (
        <RelatedPods resource={resource} labelSelector={labelSelector} />
      )}
    </LayoutPanel>
  );
};
