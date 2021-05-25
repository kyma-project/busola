import React from 'react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel, Icon, Link } from 'fundamental-react';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from '../../../../Nodes/NodeResources/NodeResources';
import { ClusterNodesWarnings } from './NodeWarningsList';
import './ClusterNodes.scss';

const Message = ({ content }) => <p className="body-fallback">{content}</p>;

const NodeHeader = ({ nodeName }) => {
  const navigateToNodeDetails = nodeName =>
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);

  return (
    <Link className="link" onClick={() => navigateToNodeDetails(nodeName)}>
      {nodeName}
    </Link>
  );
};

export function ClusterNodes() {
  const { nodes, error, loading } = useNodesQuery();

  return (
    <>
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
            <NodeResources
              key={node.name}
              {...node}
              headerContent={<NodeHeader nodeName={node.name} />}
            />
          ))}
        </LayoutPanel.Body>
      </LayoutPanel>
      <ClusterNodesWarnings nodesNames={nodes?.map(n => n.name) || []} />
    </>
  );
}
