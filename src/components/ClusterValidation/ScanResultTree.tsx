import { Tree, TreeItem, FlexBox } from '@ui5/webcomponents-react';
import {
  ScanResult,
  ScanResourceStatus,
  ScanClusterStatus,
  ScanItemStatus,
  ScanNamespaceStatus,
} from './ScanResult';

const sum = (summed: number, x: number) => summed + x;

const ScanResultItemTree = ({ item }: { item: ScanItemStatus }) => {
  const warningCount = item.warnings?.length ?? 0;

  return {
    warningCount,
    treeItem: (
      <TreeItem
        text={item.name}
        additionalText={`${warningCount} warnings`}
        additionalTextState={warningCount > 0 ? 'Warning' : 'Success'}
      >
        {item.warnings?.map(warning => (
          <>
            <TreeItem
              text={typeof warning === 'string' ? warning : warning.message}
            ></TreeItem>
          </>
        ))}
      </TreeItem>
    ),
  };
};

const ScanResultItemsTree = ({ items }: { items?: ScanItemStatus[] }) => {
  const mappedItems = items?.map(item => ScanResultItemTree({ item }));
  const warningCount =
    mappedItems?.map(resource => resource.warningCount).reduce(sum, 0) ?? 0;
  return {
    warningCount,
    elements: mappedItems?.map(item => item.treeItem),
  };
};

const ScanResultResourceTree = ({
  resources,
}: {
  resources?: ScanResourceStatus[];
}) => {
  const filteredResources = resources?.filter(
    resource => resource.items && resource.items.length > 0,
  );
  const mappedResources = filteredResources?.map(resource => {
    const { elements, warningCount } = ScanResultItemsTree({
      items: resource.items,
    });
    return {
      warningCount,
      treeItem: (
        <TreeItem
          text={resource.kind}
          additionalText={`${warningCount} warnings`}
          additionalTextState={warningCount > 0 ? 'Warning' : 'Success'}
        >
          {elements}
        </TreeItem>
      ),
    };
  });

  return {
    warningCount:
      mappedResources?.map(resource => resource.warningCount).reduce(sum, 0) ??
      0,
    elements: <>{mappedResources?.map(resource => resource.treeItem)}</>,
  };
};

const ScanResultClusterTree = ({
  cluster,
}: {
  cluster?: ScanClusterStatus;
}) => {
  const { elements, warningCount } = ScanResultResourceTree({
    resources: cluster?.resources,
  });
  return (
    <>
      <TreeItem
        text="Cluster Resources"
        additionalText={`${warningCount} warnings`}
        additionalTextState={warningCount > 0 ? 'Warning' : 'Success'}
      >
        {elements}
      </TreeItem>
    </>
  );
};

const ScanResultNamespaceTree = ({
  namespace,
}: {
  namespace: ScanNamespaceStatus;
}) => {
  const { elements, warningCount } = ScanResultResourceTree({
    resources: namespace.resources,
  });
  return {
    warningCount,
    treeItem: (
      <TreeItem
        text={namespace.name}
        additionalText={`${warningCount} warnings`}
        additionalTextState={warningCount > 0 ? 'Warning' : 'Success'}
      >
        {elements}
      </TreeItem>
    ),
  };
};

const ScanResultNamespacesTree = ({
  namespaces,
}: {
  namespaces?: ScanNamespaceStatus[];
}) => {
  const mappedNamespaces = namespaces?.map(namespace =>
    ScanResultNamespaceTree({ namespace }),
  );

  const warningCount =
    mappedNamespaces?.map(resource => resource.warningCount).reduce(sum, 0) ??
    0;

  return (
    <>
      <TreeItem
        expanded
        text="Namespaces"
        additionalText={`${warningCount} warnings`}
        additionalTextState={warningCount > 0 ? 'Warning' : 'Success'}
      >
        {mappedNamespaces?.map(({ treeItem }) => treeItem)}
      </TreeItem>
    </>
  );
};

export const ScanResultTree = ({ scanResult }: { scanResult?: ScanResult }) => {
  console.log(scanResult);
  if (!scanResult) return <FlexBox justifyContent="Center">No Results</FlexBox>;
  return (
    <>
      <Tree>
        <ScanResultClusterTree cluster={scanResult.cluster} />
        <ScanResultNamespacesTree
          namespaces={
            scanResult.namespaces && Object.values(scanResult.namespaces)
          }
        />
      </Tree>
    </>
  );
};
