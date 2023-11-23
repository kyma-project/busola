import React from 'react';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useTranslation } from 'react-i18next';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsHeader } from '../NodeDetailsHeader';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { useFeature } from 'hooks/useFeature';

import { spacing } from '@ui5/webcomponents-react-base';
import './NodeDetails.scss';

function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();
  useWindowTitle(t('nodes.title_details', { nodeName }));
  const isPrometheusEnabled = useFeature('PROMETHEUS')?.isEnabled;

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
        content={
          <>
            {data && (
              <>
                <div
                  className={`panels ${
                    isPrometheusEnabled ? 'withPrometheus' : ''
                  }`}
                  style={spacing.sapUiMediumMargin}
                >
                  {isPrometheusEnabled ? (
                    <StatsPanel
                      type="node"
                      nodeName={data.node.metadata.name}
                    />
                  ) : (
                    <NodeResources
                      {...data}
                      headerContent={t('common.headers.resources')}
                    />
                  )}
                  <MachineInfo
                    nodeInfo={data.node.status.nodeInfo}
                    capacity={data.node.status.capacity}
                  />
                </div>
                {Events}
              </>
            )}
          </>
        }
      />
    </div>
  );
}

export default NodeDetails;
