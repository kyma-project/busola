import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'shared/components/Labels/Labels';
import { LayoutPanel } from 'fundamental-react';
import './Selector.scss';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';
import { isEmpty, isEqual } from 'lodash';

const SelectorDetails = ({
  expressions,
  labels,
  namespace,
  RelatedResources,
}) => {
  const filterByLabels = pod => {
    if (!pod.metadata?.labels) return false;

    const podLabels = Object?.entries(pod.metadata?.labels);
    const resourceLabels = Object?.entries(labels);
    return resourceLabels.every(resLabel =>
      podLabels.some(podLabel => isEqual(resLabel, podLabel)),
    );
  };

  const relatedResources = RelatedResources ? (
    <RelatedResources labels={labels} />
  ) : (
    <RelatedPods
      namespace={namespace}
      labels={labels}
      filter={filterByLabels}
    />
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
    <LayoutPanel
      className="fd-margin--md"
      key="workload-selector"
      data-test-id="workload-selector"
    >
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
