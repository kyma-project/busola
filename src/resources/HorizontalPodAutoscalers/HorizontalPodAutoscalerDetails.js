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
import { GenericList } from 'shared/components/GenericList/GenericList';

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
            value={status.currentReplicas ?? EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('hpas.headers.max-pods')}
            value={spec.maxReplicas}
          />
          <LayoutPanelRow
            name={t('hpas.scale-target-ref')}
            value={
              <p>
                {spec.scaleTargetRef.kind}{' '}
                <Link className="fd-link" to={pathname}>
                  {`(${spec.scaleTargetRef.name})`}
                </Link>
              </p>
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
              value={
                current[id] === '1m'
                  ? `0 / ${m.value}`
                  : `${current[id] || EMPTY_TEXT_PLACEHOLDER} / ${m.value}`
              }
            />
          ))}
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

  const HPABehavior = ({ spec }) => {
    if (!spec?.behavior) return null;

    const scaleUp = spec?.behavior?.scaleUp;
    const scaleDown = spec?.behavior?.scaleDown;

    const rowRenderer = policy => {
      return [policy.type, policy.value, policy.periodSeconds];
    };

    return (
      <LayoutPanel className="fd-margin--md " key="hpa-behavior">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('hpas.headers.behavior')} />
        </LayoutPanel.Header>
        {scaleUp && (
          <LayoutPanel className="fd-margin--md " key="hpa-behavior-scale-up">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('hpas.headers.scaleUp')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <LayoutPanelRow
                name={t('hpas.headers.stabilizationWindowSeconds')}
                value={
                  scaleUp?.stabilizationWindowSeconds ?? EMPTY_TEXT_PLACEHOLDER
                }
              />
              <LayoutPanelRow
                name={t('hpas.headers.selectPolicy')}
                value={scaleUp?.selectPolicy ?? EMPTY_TEXT_PLACEHOLDER}
              />
            </LayoutPanel.Body>
            {scaleUp?.policies && (
              <GenericList
                searchSettings={{ showSearchField: false }}
                entries={scaleUp.policies}
                key="behavior-scaleUp"
                title={t('hpas.headers.scaleUp')}
                headerRenderer={() => [
                  t('hpas.headers.type'),
                  t('hpas.headers.value'),
                  t('hpas.headers.periodSeconds'),
                ]}
                rowRenderer={rowRenderer}
              />
            )}
          </LayoutPanel>
        )}
        {scaleDown && (
          <LayoutPanel className="fd-margin--md " key="hpa-behavior-scale-up">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('hpas.headers.scaleDown')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <LayoutPanelRow
                name={t('hpas.headers.stabilizationWindowSeconds')}
                value={
                  scaleDown?.stabilizationWindowSeconds ??
                  EMPTY_TEXT_PLACEHOLDER
                }
              />
              <LayoutPanelRow
                name={t('hpas.headers.selectPolicy')}
                value={scaleDown?.selectPolicy ?? EMPTY_TEXT_PLACEHOLDER}
              />
            </LayoutPanel.Body>
            {scaleDown?.policies && (
              <GenericList
                searchSettings={{ showSearchField: false }}
                entries={scaleDown.policies}
                key="behavior-scaleUp"
                title={t('hpas.headers.scaleDown')}
                headerRenderer={() => [
                  t('hpas.headers.type'),
                  t('hpas.headers.value'),
                  t('hpas.headers.periodSeconds'),
                ]}
                rowRenderer={rowRenderer}
              />
            )}
          </LayoutPanel>
        )}
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
      customComponents={[HPASpec, HPAMetrics, HPABehavior, Events]}
      createResourceForm={HorizontalPodAutoscalerCreate}
      {...props}
    />
  );
}
export default HorizontalPodAutoscalerDetails;
