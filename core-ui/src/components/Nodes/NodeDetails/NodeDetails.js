import React from 'react';
import { Title } from 'fundamental-react';
import { NodeWarnings } from '../NodeWarnings';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsHeader } from '../NodeDetailsHeader';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';

import './NodeDetails.scss';

export default function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
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
              headerContent={<Title level={5}>Resources</Title>}
            />
            <MachineInfo
              nodeInfo={data.node.status.nodeInfo}
              capacity={data.node.status.capacity}
            />
          </div>
          <NodeWarnings nodeName={nodeName} />
        </>
      )}
    </div>
  );
}
