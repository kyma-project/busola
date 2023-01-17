import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import pluralize from 'pluralize';

import { Tokens } from 'shared/components/Tokens';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { useUrl } from 'hooks/useUrl';

import { currentMetricsParser, metricsParser } from './helpers';
import { HorizontalPodAutoscalerCreate } from './HorizontalPodAutoscalerCreate';
import { Link } from 'react-router-dom';

export function HorizontalPodAutoscalerDetails(props) {
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

  const HPASpec = ({ spec, status }) => {
    const { namespaceUrl } = useUrl();
    const pathname = namespaceUrl(
      `${pluralize(spec.scaleTargetRef.kind.toLowerCase())}/${
        spec.scaleTargetRef.name
      }`,
    );

    return (
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
              <Link className="fd-link" to={pathname}>
                {spec.scaleTargetRef.apiVersion}/
                {pluralize(spec.scaleTargetRef.kind.toLowerCase())}{' '}
                {spec.scaleTargetRef.name}
              </Link>
            }
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

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
      namespace={props.namespace}
      filter={filterByResource('HorizontalPodAutoscaler', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      resourceName={t('hpas.name_singular')}
      customColumns={customColumns}
      customComponents={[HPASpec, HPAMetrics, Events]}
      createResourceForm={HorizontalPodAutoscalerCreate}
      {...props}
    />
  );
}
export default HorizontalPodAutoscalerDetails;
