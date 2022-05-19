import React from 'react';
import LuigiClient from '@luigi-project/client';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';
import { LayoutPanel, Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from 'components/Nodes/NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import Skeleton from 'shared/components/Skeleton/Skeleton';

import './ClusterOverviewData.scss';

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

export function ClusterOverviewData() {
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
      {loading && (
        <div className="cluster-overview__nodes">
          <Skeleton height="220px" />
        </div>
      )}
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
      <StatsPanel type="cluster" />
      {Events}
    </>
  );
}
