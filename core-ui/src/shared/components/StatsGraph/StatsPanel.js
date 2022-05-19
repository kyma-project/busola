import { zip } from 'lodash';
import React, { useState } from 'react';
import {
  LayoutPanel,
  Button,
  ButtonSegmented,
  BusyIndicator,
} from 'fundamental-react';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { getErrorMessage } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';

import { usePrometheus } from 'shared/hooks/usePrometheus';
import { StatsGraph } from 'shared/components/StatsGraph';

import './StatsPanel.scss';

const DATA_POINTS = 60;

export function SingleGraph({ type, mode, timeSpan, metric, ...props }) {
  const { t } = useTranslation();
  const {
    data,
    binary,
    unit,
    error,
    loading,
    startDate,
    endDate,
  } = usePrometheus({
    type,
    mode,
    metricId: metric,
    additionalProps: {
      items: DATA_POINTS,
      timeSpan,
      ...props,
    },
  });

  return (
    <>
      {!error ? (
        <StatsGraph
          data={data}
          binary={binary}
          unit={unit}
          startDate={startDate}
          endDate={endDate}
          dataPoints={DATA_POINTS}
          {...props}
        />
      ) : (
        <div className="error-message">
          <p>{getErrorMessage(error, t('components.error-panel.error'))}</p>
        </div>
      )}
      <BusyIndicator className="throbber" show={loading} />
    </>
  );
}

export function DualGraph({ type, timeSpan, metric1, metric2, ...props }) {
  const { t } = useTranslation();
  const {
    data: data1,
    binary,
    unit,
    error: error1,
    loading: loading1,
    startDate,
    endDate,
  } = usePrometheus({
    type,
    mode: 'single',
    metricId: metric1,
    additionalProps: {
      items: DATA_POINTS,
      timeSpan,
      ...props,
    },
  });
  const { data: data2, error: error2, loading: loading2 } = usePrometheus({
    type,
    mode: 'single',
    metricId: metric2,
    additionalProps: {
      items: DATA_POINTS,
      timeSpan,
      ...props,
    },
  });

  return (
    <>
      {!error1 && !error2 ? (
        <StatsGraph
          data={zip(data1, data2)}
          binary={binary}
          unit={unit}
          startDate={startDate}
          endDate={endDate}
          dataPoints={DATA_POINTS}
          {...props}
        />
      ) : (
        <div className="error-message">
          {error1 && (
            <p>{getErrorMessage(error1, t('components.error-panel.error'))}</p>
          )}
          {error2 && (
            <p>{getErrorMessage(error2, t('components.error-panel.error'))}</p>
          )}
        </div>
      )}
      <BusyIndicator className="throbber" show={loading1 || loading2} />
    </>
  );
}

export function SingleMetricMultipeGraph({
  type,
  mode,
  timeSpan,
  metric,
  labels,
  ...props
}) {
  const { t } = useTranslation();
  const {
    data,
    defaultLabels,
    binary,
    unit,
    error,
    loading,
    startDate,
    endDate,
  } = usePrometheus({
    type,
    mode,
    metricId: metric,
    additionalProps: {
      items: DATA_POINTS,
      timeSpan,
      ...props,
    },
  });
  return (
    <>
      {!error ? (
        <StatsGraph
          data={zip(...data)}
          binary={binary}
          unit={unit}
          startDate={startDate}
          endDate={endDate}
          dataPoints={DATA_POINTS}
          labels={labels ? labels : defaultLabels}
          {...props}
        />
      ) : (
        <div className="error-message">
          <p>{getErrorMessage(error, t('components.error-panel.error'))}</p>
        </div>
      )}
      <BusyIndicator className="throbber" show={loading} />
    </>
  );
}

const getGraphOptions = type => {
  switch (type) {
    case 'pod':
      return ['cpu', 'memory', 'network'];
    case 'cluster':
      return ['cpu', 'memory', 'network', 'nodes'];
    case 'pvc':
      return ['pvc-usage'];
    default:
      return null;
  }
};

const getDualGraphValues = (metric, t) => {
  switch (metric) {
    case 'pvc-usage':
      return {
        metric1: 'pvc-used-space',
        metric2: 'pvc-free-space',
        labels: [t('graphs.free-space'), t('graphs.used-space')],
        className: 'pvc-usage',
      };
    case 'network':
      return {
        metric1: 'network-up',
        metric2: 'network-down',
        labels: [t('graphs.network-up'), t('graphs.network-down')],
        className: 'network',
      };
    default:
      console.error(`You need to declare dual graph values for ${metric}!`);
      return {};
  }
};
const getTimeSpansByMetric = metric => {
  const longerTimeSpansGraphs = ['pvc-usage', 'nodes'];

  return longerTimeSpansGraphs.includes(metric)
    ? ['1d', '2d', '7d']
    : ['1h', '3h', '6h'];
};

export function StatsPanel({
  type,
  mode = 'single',
  defaultMetric = 'cpu',
  ...props
}) {
  const { features } = useMicrofrontendContext();
  const timeSpans = {
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
    '1d': 24 * 60 * 60,
    '2d': 2 * 24 * 60 * 60,
    '7d': 7 * 24 * 60 * 60,
  };
  const dualGraphs = ['network', 'pvc-usage'];
  const [metric, setMetric] = useState(defaultMetric);
  const visibleTimeSpans = getTimeSpansByMetric(metric);

  const [timeSpan, setTimeSpan] = useState(visibleTimeSpans[0]);
  const { t } = useTranslation();
  if (!features.PROMETHEUS?.isEnabled) {
    return '';
  }

  const graphOptions = getGraphOptions(type);
  return (
    <LayoutPanel className="fd-margin--md stats-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Filters>
          {graphOptions?.length === 1 ? (
            <LayoutPanel.Head title={t(`graphs.${graphOptions[0]}`)} />
          ) : (
            <Dropdown
              selectedKey={metric}
              onSelect={(e, val) => {
                setMetric(val.key);
                setTimeSpan(getTimeSpansByMetric(val.key)[0]);
              }}
              options={graphOptions?.map(option => ({
                key: option,
                text: t(`graphs.${option}`),
              }))}
            />
          )}
        </LayoutPanel.Filters>
        <LayoutPanel.Actions>
          <ButtonSegmented>
            {visibleTimeSpans.map(ts => (
              <Button
                compact
                key={ts}
                selected={timeSpan === ts}
                onClick={() => setTimeSpan(ts)}
              >
                {ts}
              </Button>
            ))}
          </ButtonSegmented>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {!dualGraphs.includes(metric) &&
          (mode === 'multiple' ? (
            <SingleMetricMultipeGraph
              type={type}
              mode={mode}
              metric={metric}
              className={metric}
              timeSpan={timeSpans[timeSpan]}
              {...props}
            />
          ) : (
            <SingleGraph
              type={type}
              mode={mode}
              metric={metric}
              className={metric}
              timeSpan={timeSpans[timeSpan]}
              {...props}
            />
          ))}
        {dualGraphs.includes(metric) && (
          <DualGraph
            type={type}
            timeSpan={timeSpans[timeSpan]}
            {...getDualGraphValues(metric, t)}
            {...props}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
