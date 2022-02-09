import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { MetricsBrief } from '../Details/HPA/helpers';

export const HorizontalPodAutoscalersList = ({
  DefaultRenderer,
  ...otherParams
}) => {
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
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('hpas.title')}
      description={description}
      {...otherParams}
    />
  );
};
