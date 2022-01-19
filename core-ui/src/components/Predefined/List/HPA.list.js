import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Trans } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { currentMetricsParser, metricsParser } from '../Details/HPA/helpers';

export const HorizontalPodAutoscalersList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('hpas.headers.metrics'),
      value: ({ spec, status }) => {
        const metrics = metricsParser(spec.metrics);
        const current = currentMetricsParser(status.currentMetrics);

        const remaining = metrics.length - 1;

        return (
          <>
            {current[0] || EMPTY_TEXT_PLACEHOLDER} / {metrics[0].value}{' '}
            {remaining > 0
              ? t('hpas.and-x-more', { x: remaining.toString() })
              : ''}
          </>
        );
      },
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
