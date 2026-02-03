import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { Text } from '@ui5/webcomponents-react';

import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useNodeQuery, useResourceByNode } from '../nodeQueries';
import { MachineInfo } from '../MachineInfo/MachineInfo';
import { NodeResources } from '../NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceForm } from 'shared/ResourceForm';
import { Description } from 'shared/components/Description/Description';
import { getAvailableNvidiaGPUs } from 'components/Nodes/nodeHelpers';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

export default function NodeDetails({ nodeName }) {
  const { data, error, loading } = useNodeQuery(nodeName);
  const { t } = useTranslation();
  const node = useMemo(() => data?.node, [data]);
  useWindowTitle(t('nodes.title_details', { nodeName }));
  const { data: resources, loading: loadingMetrics } =
    useResourceByNode(nodeName);

  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  useEffect(() => {
    setLayoutColumn({
      layout: 'OneColumn',
      startColumn: {
        resourceType: 'nodes',
        resourceName: nodeName,
        rawResourceTypeName: 'Node',
        apiVersion: 'v1',
      },
      midColumn: null,
      endColumn: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeName]);

  if (loading) return <Spinner />;
  if (error) return <Text>{error}</Text>;

  const gpus = node ? getAvailableNvidiaGPUs([node]) : 0;

  const filterByHost = (e) => e.source.host === nodeName;

  const customComponents = [
    () =>
      loadingMetrics ? (
        <Spinner key="node-resources" />
      ) : (
        <div className="flexwrap" key="node-resources">
          <NodeResources metrics={data.metrics} resources={resources} />
        </div>
      ),
    () => (
      <EventsList
        key="events-list"
        filter={filterByHost}
        defaultType={EVENT_MESSAGE_TYPE.WARNING}
      />
    ),
  ];

  const customColumns = [
    {
      header: t('node-details.region'),
      value: (node) => node.metadata?.labels?.['topology.kubernetes.io/region'],
    },
    {
      header: t('node-details.zone'),
      value: (node) => node.metadata?.labels?.['topology.kubernetes.io/zone'],
    },
    {
      header: t('node-details.pool'),
      value: (node) => node.metadata?.labels?.['worker.gardener.cloud/pool'],
    },
    {
      header: t('node-details.machine-type'),
      value: (node) =>
        node.metadata?.labels?.['node.kubernetes.io/instance-type'],
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
            gpus={gpus}
            spec={node?.spec}
          />
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
