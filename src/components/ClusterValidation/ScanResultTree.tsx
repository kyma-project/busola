import { Tree, TreeItem, FlexBox } from '@ui5/webcomponents-react';
import {
  ScanResult,
  ScanResourceStatus,
  ScanClusterStatus,
  ScanItemStatus,
  ScanNamespaceStatus,
} from './ScanResult';

type TreeItemState = 'Success' | 'Warning' | 'None';

const sum = (summed: number, x: number) => summed + x;

const getWarningState = ({
  warningCount,
  resourceCount,
  scanned,
  unauthorized,
}: {
  warningCount: number;
  resourceCount?: number;
  scanned: boolean | number;
  unauthorized?: boolean | number;
}): { text: string; state: TreeItemState } => {
  if (!scanned)
    return {
      text: 'Not scanned',
      state: 'None',
    };
  if (unauthorized === true || unauthorized === resourceCount)
    return {
      text: 'Unauthorized',
      state: 'Warning',
    };

  const textSegments = [`${warningCount} warnings`];
  let state = warningCount > 0 ? 'Warning' : ('Success' as TreeItemState);

  if (typeof unauthorized === 'number' && unauthorized > 0) {
    textSegments.unshift(`${unauthorized}/${resourceCount} unauthorized`);
    state = 'Warning';
  }

  if (
    typeof scanned === 'number' &&
    resourceCount &&
    scanned <
      (typeof unauthorized === 'number'
        ? resourceCount - unauthorized
        : resourceCount)
  ) {
    textSegments.unshift('partially scanned');
  }

  return {
    text: textSegments.join(', '),
    state,
  };
};

const ScanResultItemTree = ({ item }: { item: ScanItemStatus }) => {
  const warningCount = item.warnings?.length ?? 0;
  const warningState = getWarningState({
    warningCount,
    scanned: true,
    unauthorized: false,
  });

  return {
    warningCount,
    treeItem: (
      <TreeItem
        text={item.name}
        additionalText={warningState.text}
        additionalTextState={warningState.state}
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
    const warningState = getWarningState({
      warningCount,
      scanned: resource.scanned,
      unauthorized: resource.unauthorized,
    });
    return {
      warningCount,
      treeItem: (
        <TreeItem
          text={resource.kind}
          additionalText={warningState.text}
          additionalTextState={warningState.state}
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
    scanned:
      resources?.map(resource => (resource.scanned ? 1 : 0)).reduce(sum, 0) ??
      0,
    unauthorized:
      resources
        ?.map(resource => (resource.unauthorized ? 1 : 0))
        .reduce(sum, 0) ?? 0,
    resourceCount: resources?.length ?? 0,
    elements: <>{mappedResources?.map(resource => resource.treeItem)}</>,
  };
};

const ScanResultClusterTree = ({
  cluster,
}: {
  cluster?: ScanClusterStatus;
}) => {
  const {
    elements,
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
  } = ScanResultResourceTree({
    resources: cluster?.resources,
  });
  const warningState = getWarningState({
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
  });
  return (
    <>
      <TreeItem
        text="Cluster Resources"
        additionalText={warningState.text}
        additionalTextState={warningState.state}
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
  const {
    elements,
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
  } = ScanResultResourceTree({
    resources: namespace.resources,
  });
  const warningState = getWarningState({
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
  });
  return {
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
    treeItem: (
      <TreeItem
        text={namespace.name}
        additionalText={warningState.text}
        additionalTextState={warningState.state}
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
    mappedNamespaces?.map(namespace => namespace.warningCount).reduce(sum, 0) ??
    0;

  const scanned =
    mappedNamespaces?.map(namespace => namespace.scanned).reduce(sum, 0) ?? 0;
  const unauthorized =
    mappedNamespaces?.map(namespace => namespace.unauthorized).reduce(sum, 0) ??
    0;
  const resourceCount =
    mappedNamespaces
      ?.map(namespace => namespace.resourceCount)
      .reduce(sum, 0) ?? 0;

  const warningState = getWarningState({
    warningCount,
    scanned,
    unauthorized,
    resourceCount,
  });
  return (
    <>
      <TreeItem
        expanded
        text="Namespaces"
        additionalText={warningState.text}
        additionalTextState={warningState.state}
      >
        {mappedNamespaces?.map(({ treeItem }) => treeItem)}
      </TreeItem>
    </>
  );
};

export const ScanResultTree = ({ scanResult }: { scanResult?: ScanResult }) => {
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
