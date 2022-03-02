import { zip } from 'lodash';
import React, { useState } from 'react';
import {
  LayoutPanel,
  Button,
  ButtonSegmented,
  BusyIndicator,
} from 'fundamental-react';
import { Dropdown, getErrorMessage } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { usePrometheus } from 'shared/hooks/usePrometheus';
import { StatsGraph } from 'shared/components/StatsGraph';

import './StatsPanel.scss';

const DATA_POINTS = 60;

export function SingleGraph({ type, timeSpan, metric, ...props }) {
  const { t } = useTranslation();
  const {
    data,
    binary,
    unit,
    error,
    loading,
    startDate,
    endDate,
  } = usePrometheus(type, metric, {
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
  } = usePrometheus(type, metric1, {
    items: DATA_POINTS,
    timeSpan,
    ...props,
  });
  const { data: data2, error: error2, loading: loading2 } = usePrometheus(
    type,
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

export function StatsPanel({ type, ...props }) {
  const timeSpans = {
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
  };
  const [timeSpan, setTimeSpan] = useState('1h');
  const [metric, setMetric] = useState('cpu');
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md stats-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Filters>
          <Dropdown
            selectedKey={metric}
            onSelect={(e, val) => setMetric(val.key)}
            options={['cpu', 'memory', 'network'].map(option => ({
              key: option,
              text: t(`graphs.${option}`),
            }))}
          />
        </LayoutPanel.Filters>
        <LayoutPanel.Actions>
          <ButtonSegmented>
            {Object.keys(timeSpans).map(ts => (
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
        {metric !== 'network' && (
          <SingleGraph
            type={type}
            metric={metric}
            className={metric}
            timeSpan={timeSpans[timeSpan]}
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
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
