import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Pagination } from 'react-shared';
import { LayoutPanel, Link } from 'fundamental-react';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from '../../../../Nodes/NodeResources/NodeResources';
import { ClusterNodesWarnings } from './NodeWarningsList';
import './ClusterNodes.scss';

const Message = ({ content }) => <p className="body-fallback">{content}</p>;

const NodeHeader = ({ nodeName }) => {
  const navigateToNodeDetails = nodeName =>
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);

  return (
    <>
      <p className="node-header-title">Node:</p>
      <Link className="link" onClick={() => navigateToNodeDetails(nodeName)}>
        {nodeName}
      </Link>
    </>
  );
};

export function ClusterNodes() {
  const { nodes, error, loading } = useNodesQuery();
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  const pagedNodes =
    nodes?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ) || [];

  return (
    <>
      {loading && <Message content="Loading..." />}
      {error && (
        <LayoutPanel className="fd-margin--md">
          <LayoutPanel.Header>
            <LayoutPanel.Head title="Metrics" />
          </LayoutPanel.Header>
          <LayoutPanel.Body>Error: {error.message}</LayoutPanel.Body>
        </LayoutPanel>
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
      <LayoutPanel.Footer>
        <Pagination
          itemsTotal={nodes?.length || 0}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onChangePage={setCurrentPage}
        />
      </LayoutPanel.Footer>
      <ClusterNodesWarnings nodesNames={nodes?.map(n => n.name) || []} />
    </>
  );
}
