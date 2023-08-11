import { Warning } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { PermissionSet } from 'state/permissionSetsSelector';
import { ValidationSchema } from 'state/validationSchemasAtom';
import { K8sAPIResource } from 'types';

export type ScanResultSummary = {
  warningCount?: number;
  scanned?: number;
  unauthorized?: number;
  resourceCount?: number;
  parent?: ScanResultSummary;
  children?: ScanResultSummary[];
  resource?: ScanResourceStatus;
};

export type ScanItemStatus = {
  name: string;
  warnings?: Warning[];
};

export type ScanResourceStatus = {
  kind: string;
  endpoint: string;
  unauthorized?: boolean;
  scanned: boolean;
  items?: ScanItemStatus[];
  summary?: ScanResultSummary;
};

export type ScanNamespaceStatus = {
  name: string;
  resources: ScanResourceStatus[];
  permissionSets?: PermissionSet[];
  summary?: ScanResultSummary;
};

export type ScanClusterStatus = {
  name?: string; // identifier for the cluster?
  resources: ScanResourceStatus[];
  permissionSets?: PermissionSet[];
  summary?: ScanResultSummary;
};

export type ScanResult = {
  cluster?: ScanClusterStatus;
  namespaces?: {
    [name: string]: ScanNamespaceStatus;
  };
  scanStart: Date;
  scanEnd?: Date;
  ruleset?: ValidationSchema;
  resources?: K8sAPIResource[];
  summary?: ScanResultSummary;
  namespaceSummary?: ScanResultSummary;
};

export function getInitialScanResult(ruleset: ValidationSchema): ScanResult {
  return {
    scanStart: new Date(),
    ruleset,
  };
}
