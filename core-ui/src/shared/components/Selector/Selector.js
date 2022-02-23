import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import './Selector.scss';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';

const SelectorParameters = ({
  expressions,
  labels,
  namespace,
  RelatedResources,
}) => {
  let labelSelector;
  if (labels) {
    labelSelector = Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
  }

  const relatedResources = RelatedResources ? (
    <RelatedResources labelSelector={labelSelector} />
  ) : (
    <RelatedPods namespace={namespace} labelSelector={labelSelector} />
  );

  return expressions ? (
    <MatchExpressionsList expressions={expressions} />
  ) : (
    relatedResources
  );
};

export const Selector = ({
  namespace,
  labels,
  expressions,
  title,
  selector,
  message,
  RelatedResources,
  isIstioSelector,
}) => {
  const { t } = useTranslation();

  if (!isIstioSelector && !selector) {
    // when k8s selector is null it matches all
    // if it's null it doesn't
    // istio selector works conversely
    return null;
  }

  const isSelectorEmpty =
    (!labels && !expressions) || (isIstioSelector && !selector);

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('selector.title')}
          className="header"
        />
        {labels ? <Labels labels={labels} /> : null}
      </LayoutPanel.Header>
      {isSelectorEmpty ? (
        <LayoutPanel.Body>
          <p>{message || t('selector.message.empty-selector')}</p>
        </LayoutPanel.Body>
      ) : (
        <SelectorParameters
          expressions={expressions}
          namespace={namespace}
          labels={labels}
          RelatedResources={RelatedResources}
        />
      )}
    </LayoutPanel>
  );
};
