import React, { useState } from 'react';
import {
  LayoutPanel,
  Button,
  ButtonSegmented,
  BusyIndicator,
} from 'fundamental-react';
import { Dropdown } from 'react-shared';

import { usePrometheus } from 'shared/hooks/usePrometheus';
import { StatsGraph, barsRenderer } from 'shared/components/StatsGraph';

import './PodStatsGraph.scss';

export function PodStatsGraph(resource) {
  const timeSpans = {
    // '1m': 60,
    '30m': 30 * 60,
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
  };
  const [timeSpan, setTimeSpan] = useState('1h');
  const [metric, setMetric] = useState('cpu');

  const {
    data,
    unit,
    // error,
    loading,
  } = usePrometheus({
    // fields: ['cpu'],
    // fields: ['memory'],
    metric,
    items: 60,
    timeSpan: timeSpans[timeSpan],
    selector: `namespace="${resource.metadata.namespace}",pod="${resource.metadata.name}"`,
  });

  return (
    <LayoutPanel className="fd-margin--md container-panel">
      <LayoutPanel.Header>
        {/*<LayoutPanel.Head title="CPU usage" />*/}
        <LayoutPanel.Head
          title={
            <Dropdown
              selectedKey={metric}
              onSelect={(e, val) => setMetric(val.key)}
              options={[
                { key: 'cpu', text: 'CPU' },
                { key: 'cpu-percent', text: 'CPU %' },
                { key: 'memory', text: 'Memory' },
                // { key: 'memory%', text: 'Memory %' },
                { key: 'network-down', text: 'Network Download' },
                { key: 'network-up', text: 'Network Upload' },
              ]}
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
      <LayoutPanel.Body className="stats-graph-container">
        <StatsGraph
          className={metric}
          data={data}
          dataPoints={60}
          unit={unit}
          renderer={barsRenderer}
          graphs={[{ renderer: barsRenderer }]}
        />
        <BusyIndicator className="throbber" show={loading} size="s" />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
