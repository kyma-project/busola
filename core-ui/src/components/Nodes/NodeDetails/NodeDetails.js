import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from 'fundamental-react';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsHeader } from '../NodeDetailsHeader';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { ComponentForList } from 'shared/getComponents';

import './NodeDetails.scss';

export function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();

  const filterByHost = e => e.source.host === nodeName;

  const eventsParams = {
    resourceUrl: `/api/v1/events`,
    resourceType: 'Events',
    isCompact: true,
    filter: filterByHost,
  };

  const Events = <ComponentForList name="eventsList" params={eventsParams} />;

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
