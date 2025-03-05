import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useTranslation } from 'react-i18next';
import { useNodeQuery, useResourceByNode } from '../nodeQueries';
import { NodeDetailsCard } from '../NodeDetailsCard';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { Title } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceForm } from 'shared/ResourceForm';
import { useMemo } from 'react';
import { Description } from 'shared/components/Description/Description';

export default function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();
  const node = useMemo(() => data?.node, [data]);
  useWindowTitle(t('nodes.title_details', { nodeName }));
  const { data: resources, loading: loadingMetrics } = useResourceByNode(
    nodeName,
  );
  if (loading) return <Spinner />;

  const filterByHost = e => e.source.host === nodeName;

  const customComponents = [
    () =>
      loadingMetrics ? (
        <Spinner />
      ) : (
        <div className="flexwrap sap-margin-x-small sap-margin-top-small">
          <NodeResources metrics={data.metrics} resources={resources} />
        </div>
      ),
    () => (
      <EventsList
        filter={filterByHost}
        defaultType={EVENT_MESSAGE_TYPE.WARNING}
      />
    ),
  ];

  const customColumns = [
    {
      header: 'Region',
      value: node => node.metadata?.labels?.['topology.kubernetes.io/region'],
    },
    {
      header: 'Zone',
      value: node => node.metadata?.labels?.['topology.kubernetes.io/zone'],
    },
    {
      header: 'Pool',
      value: node => node.metadata?.labels?.['worker.gardener.cloud/pool'],
    },
  ];

  return (
    <>
      <ResourceDetails
        hideLabels
        hideAnnotations
        customColumns={customColumns}
        description={
          <Description
            i18nKey={'nodes.description'}
            url={'https://kubernetes.io/docs/concepts/architecture/nodes/'}
          />
        }
        resourceType="Nodes"
        resourceName={nodeName}
        resourceUrl={`/api/v1/nodes/${nodeName}`}
        resource={node}
        customStatus={
          <MachineInfo
            nodeInfo={node?.status.nodeInfo}
            capacity={node?.status.capacity}
            addresses={node?.status.addresses}
            spec={node?.spec}
          />
        }
        customStatusColumns={
          <>
            {data && (
              <>
                <Title
                  level="H3"
                  size="H3"
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
                </div>
                <Title
                  level="H3"
                  size="H3"
                  className="sap-margin-begin-medium sap-margin-top-medium sap-margin-bottom-small"
                >
                  {t('common.headers.nodeInfo')}
                </Title>
              </>
            )}
          </>
        }
        customComponents={customComponents}
        createResourceForm={() => (
          <ResourceForm resource={node} initialResource={node} onlyYaml />
        )}
        disableEdit
        disableDelete
      />
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
