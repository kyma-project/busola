import { Warning } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { PermissionSet } from 'state/permissionSetsSelector';
import { ValidationSchema } from 'state/validationSchemasAtom';
import { K8sAPIResource } from 'types';

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
};

export type ScanNamespaceStatus = {
  name: string;
  resources: ScanResourceStatus[];
  permissionSets?: PermissionSet[];
};

export type ScanClusterStatus = {
  name?: string; // identifier for the cluster?
  resources: ScanResourceStatus[];
  permissionSets?: PermissionSet[];
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
};

export function getInitialScanResult(ruleset: ValidationSchema): ScanResult {
  return {
    scanStart: new Date(),
    ruleset,
  };
}
