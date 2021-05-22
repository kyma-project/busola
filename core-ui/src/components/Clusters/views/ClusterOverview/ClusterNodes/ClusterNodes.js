import React from 'react';
import { LayoutPanel, Icon } from 'fundamental-react';
import { useNodesQuery } from './useNodesQuery';
import { NodeDetails } from './NodeDetails';
import './ClusterNodes.scss';

export function ClusterNodes() {
  const { nodes, error, loading } = useNodesQuery();

  const Message = ({ content }) => <p className="body-fallback">{content}</p>;

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <Icon
          size="m"
          className="fd-margin-end--sm"
          glyph="stethoscope"
          ariaLabel="Node status icon"
        />
        <LayoutPanel.Head title="Nodes Status" />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="cluster-overview__nodes">
        {loading && <Message content="Loading..." />}
        {error && <Message content={error.message} />}
        {nodes?.map(node => (
          <NodeDetails key={node.name} {...node} />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
