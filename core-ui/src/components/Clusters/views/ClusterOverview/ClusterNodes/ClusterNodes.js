import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Pagination, Spinner, ErrorPanel } from 'react-shared';
import { LayoutPanel, Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from 'components/Nodes/NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

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
      {Events}
    </>
  );
}
