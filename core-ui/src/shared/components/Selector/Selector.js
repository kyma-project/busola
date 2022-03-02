import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import './Selector.scss';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';
import { isEmpty } from 'lodash';

const SelectorDetails = ({
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
  // when k8s selector is empty it matches all
  // if it's null it doesn't
  // istio selector works conversely

  if (!isIstioSelector && !selector) {
    return null;
  }

  const isSelectorDefinedOrEmpty =
    (!labels && !expressions) || (!selector && isIstioSelector);

  const selectorLabels = !isEmpty(labels) ? labels : null;

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('selector.title')}
          className="header"
        />
        {selectorLabels ? <Labels labels={selectorLabels} /> : null}
      </LayoutPanel.Header>
      {isSelectorDefinedOrEmpty ? (
        <LayoutPanel.Body>
          <p>{message || t('selector.message.empty-selector')}</p>
        </LayoutPanel.Body>
      ) : (
        <SelectorDetails
          expressions={expressions}
          namespace={namespace}
          labels={selectorLabels}
          RelatedResources={RelatedResources}
        />
      )}
    </LayoutPanel>
  );
};
