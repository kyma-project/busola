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

export function StatsPanel({ type, ...props }) {
  const timeSpans = {
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
  };
  const [timeSpan, setTimeSpan] = useState('1h');
  const [metric, setMetric] = useState('cpu');
  const { t } = useTranslation();

  const {
    data,
    binary,
    unit,
    loading,
    startDate,
    endDate,
    error,
  } = usePrometheus(type, metric, {
    items: 60,
    timeSpan: timeSpans[timeSpan],
    ...props,
  });
  return (
    <LayoutPanel className="fd-margin--md stats-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={
            <Dropdown
              selectedKey={metric}
              onSelect={(e, val) => setMetric(val.key)}
              options={[
                'cpu',
                'memory',
                'network-down',
                'network-up',
              ].map(option => ({ key: option, text: t(`graphs.${option}`) }))}
            />
          }
        />
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
        {!error ? (
          <StatsGraph
            className={metric}
            data={data}
            dataPoints={60}
            binary={binary}
            unit={unit}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="error-message">
            <p>{getErrorMessage(error, t('components.error-panel.error'))}</p>
          </div>
        )}
        <BusyIndicator className="throbber" show={loading} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
