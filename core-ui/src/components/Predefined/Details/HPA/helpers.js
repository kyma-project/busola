import React from 'react';
import i18n from 'i18next';
import { Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { Labels } from 'react-shared/';

const metricsTargetParser = (mt, type) => {
  let value = null;
  switch (type || mt.type) {
    case 'Utilization':
      value = mt.averageUtilization
        ? `${mt.averageUtilization}%`
        : mt.averageValue;
      break;
    case 'Value':
      value = mt.value;
      break;
    case 'AverageValue':
      value = mt.averageValue;
      break;
    default:
      break;
  }
  return value;
};

export const currentMetricsParser = metrics => {
  return (
    metrics?.map(m => {
      const resType = m.type.charAt(0).toLowerCase() + m.type.slice(1);
      const { averageUtilization, averageValue, value } =
        m[resType]?.current || {};
      const avgUtil = averageUtilization ? `${averageUtilization}%` : null;
      const avgVal = averageValue;
      const val = value;

      return avgUtil || avgVal || val || EMPTY_TEXT_PLACEHOLDER;
    }) || []
  );
};

export const metricsParser = metrics => {
  return metrics.map(m => {
    const type = m.type.charAt(0).toLowerCase() + m.type.slice(1);
    let i18label = null;
    let name = null;
    const value = metricsTargetParser(m[type].target);

    switch (m.type) {
      case 'ContainerResource':
        i18label = 'hpas.container-resource';
        name = `${m[type].name}/${m[type].container}`;
        break;
      case 'External':
        i18label = 'hpas.external';
        name = m[type].metric.selector || m[type].metric.name;
        break;
      case 'Object':
        i18label = 'hpas.object';
        name = (
          <>
            {m[type].metric.name} {i18n.t('hpas.on')}{' '}
            <Link
              className="fd-link"
              data-test-id="service-instance-name"
              onClick={() =>
                LuigiClient.linkManager()
                  .fromContext('namespace')
                  .navigate(
                    `${pluralize(
                      pluralize(m[type].describedObject.kind).toLowerCase(),
                    )}/details/${m[type].describedObject.name}`,
                  )
              }
            >
              {pluralize(m[type].describedObject.kind).toLowerCase()}/
              {m[type].describedObject.name}
            </Link>
            <Labels labels={m[type].metric.selector?.matchLabels} />
          </>
        );
        break;
      case 'Pods':
        i18label = 'hpas.pods';
        name = `${m[type].metric.selector || m[type].metric.name}`;
        break;
      case 'Resource':
        i18label = 'hpas.resource';
        name = `${m[type].name === 'cpu' ? 'CPU' : m[type].name} ${i18n.t(
          'hpas.on-pods',
        )}`;
        break;
      default:
        break;
    }

    return {
      i18label,
      name,
      value,
    };
  });
};

export const MetricsBrief = ({ spec, status }) => {
  const { t } = useTranslation();
  const metrics = metricsParser(spec.metrics);
  const current = currentMetricsParser(status.currentMetrics);

  const remaining = metrics.length - 1;

  return (
    <>
      {current[0] || EMPTY_TEXT_PLACEHOLDER} / {metrics[0].value}{' '}
      {remaining > 0 ? t('hpas.and-x-more', { x: remaining.toString() }) : ''}
    </>
  );
};
