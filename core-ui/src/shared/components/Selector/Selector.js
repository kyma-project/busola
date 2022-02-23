import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import './Selector.scss';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';

const SelectorParameters = ({ expressions, labels, namespace }) => {
  let labelSelector;
  if (labels) {
    labelSelector = Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
  }

  return expressions ? (
    <MatchExpressionsList expressions={expressions} />
  ) : (
    <RelatedPods namespace={namespace} labelSelector={labelSelector} />
  );
};

export const Selector = ({
  namespace,
  labels,
  expressions,
  title,
  selector,
}) => {
  const { t } = useTranslation();
  if (!selector) return null;

  const isSelectorEmpty = !labels && !expressions;

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('workload-selector.title')}
          className="header"
        />
        {labels ? <Labels labels={labels} /> : null}
      </LayoutPanel.Header>
      {isSelectorEmpty ? (
        <LayoutPanel.Body>
          <p>Matches all Pods in the Namespace</p>
        </LayoutPanel.Body>
      ) : (
        <SelectorParameters
          expressions={expressions}
          namespace={namespace}
          labels={labels}
        />
      )}
    </LayoutPanel>
  );
};
