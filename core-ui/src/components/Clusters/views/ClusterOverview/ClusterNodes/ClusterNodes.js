import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Pagination, Spinner, ErrorPanel } from 'react-shared';
import { LayoutPanel, Link, Button, ButtonSegmented } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from 'components/Nodes/NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import { Dropdown } from 'react-shared';
import { usePrometheus } from 'shared/hooks/usePrometheus';
import { barsRenderer, StatsGraph } from 'shared/components/StatsGraph';

import './ClusterNodes.scss';

const NodeHeader = ({ nodeName }) => {
  const navigateToNodeDetails = nodeName =>
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);

  return (
    <>
      <p className="node-header-title">Node:</p>
      <Link className="fd-link" onClick={() => navigateToNodeDetails(nodeName)}>
        {nodeName}
      </Link>
    </>
  );
};

export function ClusterNodes() {
  const { nodes, error, loading } = useNodesQuery();
  const { i18n } = useTranslation();
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  const pagedNodes =
    nodes?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ) || [];

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  const timeSpans = {
    '30m': 30 * 60,
    '1h': 60 * 60,
    '3h': 3 * 60 * 60,
    '6h': 6 * 60 * 60,
  };
  const [timeSpan, setTimeSpan] = useState('1h');
  const [metric, setMetric] = useState('cpu');
  const { data, unit } = usePrometheus({
    metric,
    items: 60,
    timeSpan: timeSpans[timeSpan],
    selector: '',
  });

  return (
    <>
      {loading && <Spinner compact={true} />}
      {error && !nodes && (
        <ErrorPanel error={error} title="Metrics" i18n={i18n} />
      )}
      <div className="cluster-overview__nodes">
        {pagedNodes.map(node => (
          <NodeResources
            key={node.name}
            {...node}
            headerContent={<NodeHeader nodeName={node.name} />}
          />
        ))}
      </div>
      {nodes?.length > itemsPerPage && (
        <LayoutPanel.Footer>
          <Pagination
            itemsTotal={nodes?.length || 0}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
          />
        </LayoutPanel.Footer>
      )}
      <LayoutPanel className="fd-margin--md container-panel">
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={
              <Dropdown
                selectedKey={metric}
                onSelect={(e, val) => setMetric(val.key)}
                options={[
                  { key: 'cpu', text: 'CPU' },
                  { key: 'cpu%', text: 'CPU %' },
                  { key: 'memory', text: 'Memory' },
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
        <LayoutPanel.Body>
          <StatsGraph
            data={data}
            dataPoints={60}
            unit={unit}
            renderer={barsRenderer}
            graphs={[{ renderer: barsRenderer }]}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
      {Events}
    </>
  );
}
