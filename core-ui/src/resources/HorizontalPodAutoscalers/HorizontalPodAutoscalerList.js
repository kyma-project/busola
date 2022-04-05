import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Tokens } from 'shared/components/Tokens';

import { MetricsBrief } from './helpers';
import { HorizontalPodAutoscalerCreate } from './HorizontalPodAutoscalerCreate';

export function HorizontalPodAutoscalerList(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('hpas.headers.metrics'),
      value: resource => <MetricsBrief {...resource} />,
    },
    {
      header: t('hpas.headers.min-pods'),
      value: resource => resource.spec.minReplicas,
    },
    {
      header: t('hpas.headers.max-pods'),
      value: resource => resource.spec.maxReplicas,
    },
    {
      header: t('hpas.headers.replicas'),
      value: resource => resource.status.currentReplicas,
    },
    {
      header: t('common.headers.status'),
      value: resource => (
        <Tokens
          tokens={
            resource.status?.conditions?.reduce((result, condition) => {
              if (condition.status === 'True') {
                result.push(condition.type);
              }
              return result;
            }, []) || []
          }
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="hpas.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/horizontal-pod-autoscaler-v2/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('hpas.title')}
      description={description}
      createResourceForm={HorizontalPodAutoscalerCreate}
      {...props}
    />
  );
}

export default HorizontalPodAutoscalerList;
