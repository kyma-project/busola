import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, LayoutPanel } from 'fundamental-react';
import { Tokens } from 'shared/components/Tokens';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { currentMetricsParser, metricsParser } from './helpers';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import './HorizontalPodAutoscalersDetails.scss';

export function HorizontalPodAutoscalersDetails({
  DefaultRenderer,
  ...otherParams
}) {
  const { t } = useTranslation();

  const customColumns = [
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

  const HPASpec = ({ spec, status }) => (
    <LayoutPanel
      className="fd-margin--md"
      key="hpa-spec-ref"
      data-testid="hpa-spec-ref"
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('hpas.spec')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('hpas.headers.min-pods')}
          value={spec.minReplicas}
        />
        <LayoutPanelRow
          name={t('hpas.current-replicas')}
          value={status.currentReplicas}
        />
        <LayoutPanelRow
          name={t('hpas.headers.max-pods')}
          value={spec.maxReplicas}
        />
        <LayoutPanelRow
          name={t('hpas.scale-target-ref')}
          value={
            <Link
              className="fd-link"
              onClick={() =>
                LuigiClient.linkManager()
                  .fromContext('namespace')
                  .navigate(
                    `${pluralize(
                      spec.scaleTargetRef.kind.toLowerCase(),
                    )}/details/${spec.scaleTargetRef.name}`,
                  )
              }
            >
              {spec.scaleTargetRef.apiVersion}/
              {pluralize(spec.scaleTargetRef.kind.toLowerCase())}{' '}
              {spec.scaleTargetRef.name}
            </Link>
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );

  const HPAMetrics = ({ spec, status }) => {
    const metrics = metricsParser(spec.metrics);
    const current = currentMetricsParser(status.currentMetrics);

    return (
      <LayoutPanel className="fd-margin--md " key="hpa-metrics-ref">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('hpas.metrics')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {metrics.map((m, id) => (
            <LayoutPanelRow
              key={`${m.i18label}}-${m.name}`}
              name={
                <>
                  {t(m.i18label)} {m.name}
                </>
              }
              value={`${current[id] || EMPTY_TEXT_PLACEHOLDER} / ${m.value}`}
            />
          ))}
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

  const Events = () => (
    <EventsList
      namespace={otherParams.namespace}
      filter={filterByResource(
        'HorizontalPodAutoscaler',
        otherParams.resourceName,
      )}
      hideInvolvedObjects={true}
    />
  );
  return (
    <DefaultRenderer
      resourceTitle={t('hpas.title')}
      customColumns={customColumns}
      customComponents={[HPASpec, HPAMetrics, Events]}
      {...otherParams}
    />
  );
}
