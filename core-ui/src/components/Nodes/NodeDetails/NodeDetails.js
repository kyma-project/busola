import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from 'fundamental-react';
import { NodeMessages } from '../NodeMessages';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsHeader } from '../NodeDetailsHeader';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';

import './NodeDetails.scss';

export function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();
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
          <NodeMessages nodeName={nodeName} />
        </>
      )}
    </div>
  );
}
