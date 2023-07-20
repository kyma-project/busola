import { Tree, TreeItem, FlexBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import {
  ScanResult,
  ScanResourceStatus,
  ScanClusterStatus,
  ScanItemStatus,
  ScanNamespaceStatus,
} from './ScanResult';

type TreeItemState = 'Success' | 'Warning' | 'None';

type WarningStateInput = {
  warningCount?: number;
  scanned?: number;
  unauthorized?: number;
  resourceCount?: number;
};

const useWarningState = ({
  warningCount,
  resourceCount,
  scanned,
  unauthorized,
}: WarningStateInput): {
  additionalText?: string;
  additionalTextState?: TreeItemState;
} => {
  const { t } = useTranslation();
  if (!scanned)
    return {
      additionalText: t('cluster-validation.scan.not-started'),
      additionalTextState: 'None',
    };
  if (unauthorized === resourceCount)
    return {
      additionalText: t('cluster-validation.scan.unauthorized'),
      additionalTextState: 'Warning',
    };

  const textSegments = [
    t('cluster-validation.scan.warning-count', { warningCount }),
  ];
  let state =
    (warningCount ?? 0) > 0 ? 'Warning' : ('Success' as TreeItemState);

  if (typeof unauthorized === 'number' && unauthorized > 0) {
    textSegments.unshift(
      t('cluster-validation.scan.unauthorized-count', {
        unauthorized,
        resourceCount,
      }),
    );
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
    textSegments.unshift(t('cluster-validation.scan.partially-scanned'));
  }

  return {
    additionalText: textSegments.join(', '),
    additionalTextState: state,
  };
};

const ScanResultItemTree = ({ item }: { item: ScanItemStatus }) => {
  const warningCount = item.warnings?.length ?? 0;
  const warningState = useWarningState({
    warningCount,
    scanned: 1,
    unauthorized: 0,
  });

  return (
    <TreeItem key={item.name} text={item.name} {...warningState}>
      {item.warnings?.map((warning, i) => (
        <TreeItem
          key={typeof warning === 'string' ? warning : warning.key}
          text={typeof warning === 'string' ? warning : warning.message}
        ></TreeItem>
      ))}
    </TreeItem>
  );
};

const ScanResultResourceTree = ({
  resource,
}: {
  resource: ScanResourceStatus;
}) => {
  const warningState = useWarningState(resource.summary ?? {});
  return (
    <TreeItem key={resource.endpoint} text={resource.kind} {...warningState}>
      {resource.items?.map(item => (
        <ScanResultItemTree item={item} />
      ))}
    </TreeItem>
  );
};

const ScanResultResourcesTree = ({
  resources,
}: {
  resources?: ScanResourceStatus[];
}) => {
  const filteredResources = resources?.filter(
    resource => resource.items && resource.items.length > 0,
  );
  return (
    <>
      {filteredResources?.map(resource => (
        <ScanResultResourceTree resource={resource} />
      ))}
    </>
  );
};

const ScanResultClusterTree = ({
  cluster,
}: {
  cluster?: ScanClusterStatus;
}) => {
  const { t } = useTranslation();
  const warningState = useWarningState(cluster?.summary ?? {});
  return (
    <TreeItem
      key="cluster-resources"
      text={t('cluster-validation.scan.cluster-resources')}
      {...warningState}
    >
      <ScanResultResourcesTree resources={cluster?.resources} />
    </TreeItem>
  );
};

const ScanResultNamespaceTree = ({
  namespace,
}: {
  namespace: ScanNamespaceStatus;
}) => {
  const warningState = useWarningState(namespace.summary ?? {});
  return (
    <TreeItem key={namespace.name} text={namespace.name} {...warningState}>
      <ScanResultResourcesTree resources={namespace.resources} />
    </TreeItem>
  );
};

const ScanResultNamespacesTree = ({
  scanResult,
}: {
  scanResult: ScanResult;
}) => {
  const { t } = useTranslation();
  const warningState = useWarningState(scanResult.namespaceSummary ?? {});
  return (
    <TreeItem
      key="namespaces"
      expanded
      text={t('common.headers.namespaces')}
      {...warningState}
    >
      {scanResult.namespaces &&
        Object.values(scanResult.namespaces).map(namespace => (
          <ScanResultNamespaceTree namespace={namespace} />
        ))}
    </TreeItem>
  );
};

export const ScanResultTree = ({ scanResult }: { scanResult?: ScanResult }) => {
  if (!scanResult) return <FlexBox justifyContent="Center">No Results</FlexBox>;
  return (
    <>
      <Tree>
        <ScanResultClusterTree cluster={scanResult.cluster} />
        <ScanResultNamespacesTree scanResult={scanResult} />
      </Tree>
    </>
  );
};
