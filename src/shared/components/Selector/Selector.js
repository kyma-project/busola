import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels } from 'shared/components/Labels/Labels';
import { RelatedPods } from '../RelatedPods';
import { MatchExpressionsList } from '../MatchExpressionsList';
import { isEmpty, isEqual } from 'lodash';
import { Text, Title } from '@ui5/webcomponents-react';
import { UI5Panel } from '../UI5Panel/UI5Panel';

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
      disableMargin
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
    ((!labels || Object.keys(labels).length === 0) && !expressions) ||
    (!selector && isIstioSelector);

  const selectorLabels = !isEmpty(labels) ? labels : null;

  return (
    <UI5Panel
      title={
        <>
          <Title level="H5">{title || t('selector.title')}</Title>
          {selectorLabels ? <Labels labels={selectorLabels} /> : null}
        </>
      }
      keyComponent="workload-selector"
      data-test-id="workload-selector"
    >
      {isSelectorDefinedOrEmpty ? (
        <Text>{message || t('selector.message.empty-selector')}</Text>
      ) : (
        <SelectorDetails
          expressions={expressions}
          namespace={namespace}
          labels={selectorLabels}
          RelatedResources={RelatedResources}
        />
      )}
    </UI5Panel>
  );
};
