import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useTranslation } from 'react-i18next';
import { useNodeQuery } from '../nodeQueries';
import { NodeDetailsCard } from '../NodeDetailsCard';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { Title } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';

export default function NodeDetails({ nodeName }) {
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
    <>
      <DynamicPageComponent
        title={nodeName}
        className="node-details"
        content={
          <>
            {data && (
              <>
                <Title
                  level="H3"
                  className="sap-margin-begin-medium sap-margin-y-medium"
                >
                  {t('common.headers.node-details')}
                </Title>
                <div className={'node-details-container'}>
                  <NodeDetailsCard
                    nodeName={nodeName}
                    node={data?.node}
                    error={error}
                    loading={loading}
                  />
                  <MachineInfo
                    nodeInfo={data.node.status.nodeInfo}
                    capacity={data.node.status.capacity}
                  />
                </div>
                <Title
                  level="H3"
                  className="sap-margin-begin-medium sap-margin-top-medium sap-margin-bottom-small"
                >
                  {t('common.headers.nodeInfo')}
                </Title>
                <div className="flexwrap sap-margin-x-small">
                  <NodeResources {...data} />
                </div>
                {Events}
              </>
            )}
          </>
        }
      />
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
