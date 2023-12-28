import React from 'react';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { useFeature } from 'hooks/useFeature';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import ClusterStats from './ClusterStats';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const clusterValidation = useFeature('CLUSTER_VALIDATION');
  const { nodes: data, error, loading } = useNodesQuery();

  return (
    <ClusterOverviewHeader
      content={
        <>
          <Injections
            destination="ClusterOverview"
            slot="details-top"
            root=""
          />
          {data && <ClusterStats data={data} />}
          <ClusterNodes data={data} error={error} loading={loading} />
          {clusterValidation?.isEnabled && <ClusterValidation />}
          <Injections destination="ClusterOverview" slot="details-bottom" />
        </>
      }
    />
  );
}
