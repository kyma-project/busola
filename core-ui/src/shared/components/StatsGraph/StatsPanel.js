import { zip } from 'lodash';
import React, { useState, useEffect } from 'react';
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
  } = usePrometheus(type, mode, metric, {
    items: DATA_POINTS,
    timeSpan,
    ...props,
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
  } = usePrometheus(type, 'single', metric1, {
    items: DATA_POINTS,
    timeSpan,
    ...props,
  });
  const { data: data2, error: error2, loading: loading2 } = usePrometheus(
    type,
    'single',
    metric2,
    {
      items: DATA_POINTS,
      timeSpan,
      ...props,
    },
  );
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
  } = usePrometheus(type, mode, metric, {
    items: DATA_POINTS,
    timeSpan,
    ...props,
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

export function StatsPanel({ type, mode = 'single', ...props }) {
  const { features } = useMicrofrontendContext();
  const timeSpans = {
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
    '24h': 24 * 60 * 60,
    '7d': 7 * 24 * 60 * 60,
  };
  const [metric, setMetric] = useState('cpu');

  const visibleTimeSpans =
    metric === 'nodes' ? ['6h', '24h', '7d'] : ['1h', '3h', '6h'];
  const [timeSpan, setTimeSpan] = useState(visibleTimeSpans[0]);

  const { t } = useTranslation();

  useEffect(() => {
    setTimeSpan(visibleTimeSpans[0]);
  }, [metric]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!features.PROMETHEUS?.isEnabled) {
    return '';
  }

  const graphOptions =
    type === 'pod'
      ? ['cpu', 'memory', 'network']
      : ['cpu', 'memory', 'network', 'nodes'];

  return (
    <LayoutPanel className="fd-margin--md stats-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Filters>
          <Dropdown
            selectedKey={metric}
            onSelect={(e, val) => setMetric(val.key)}
            options={graphOptions.map(option => ({
              key: option,
              text: t(`graphs.${option}`),
            }))}
          />
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
        {mode === 'multiple' && metric !== 'network' && (
          <SingleMetricMultipeGraph
            type={type}
            mode={mode}
            metric={metric}
            className={metric}
            timeSpan={timeSpans[timeSpan]}
            {...props}
          />
        )}
        {mode !== 'multiple' && metric !== 'network' && (
          <SingleGraph
            type={type}
            mode={mode}
            metric={metric}
            className={metric}
            timeSpan={timeSpans[timeSpan]}
            {...props}
          />
        )}
        {metric === 'network' && (
          <DualGraph
            type={type}
            metric1={'network-up'}
            metric2={'network-down'}
            className={metric}
            timeSpan={timeSpans[timeSpan]}
            labels={[t('graphs.network-up'), t('graphs.network-down')]}
            {...props}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
