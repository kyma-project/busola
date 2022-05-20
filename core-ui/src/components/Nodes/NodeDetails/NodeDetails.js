import React from 'react';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useTranslation } from 'react-i18next';
import { Title } from 'fundamental-react';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsHeader } from '../NodeDetailsHeader';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import './NodeDetails.scss';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';

function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();
  useWindowTitle(t('nodes.title_details', { nodeName }));

  const filterByHost = e => e.source.host === nodeName;
  const Events = (
    <EventsList
      filter={filterByHost}
      defaultType={EVENT_MESSAGE_TYPE.WARNING}
    />
  );
  return (
    <div className="node-details">
      <NodeDetailsHeader
        nodeName={nodeName}
        node={data?.node}
        error={error}
        loading={loading}
      />
      {data && (
        <>
          <StatsPanel type="node" nodeName={data.node.metadata.name} />
          <div className="panels">
            <NodeResources
              {...data}
              headerContent={
                <Title level={5}>{t('common.headers.resources')}</Title>
              }
            />
            <MachineInfo
              nodeInfo={data.node.status.nodeInfo}
              capacity={data.node.status.capacity}
            />
          </div>
          {Events}
        </>
      )}
    </div>
  );
}

export default NodeDetails;
