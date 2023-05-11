import { PostFn } from 'shared/hooks/BackendAPI/usePost';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import {
  getPermissionResourceRules,
  PermissionSet,
} from 'state/permissionSetsSelector';
import { ValidationSchema } from 'state/validationSchemasAtom';
import { K8sResource } from 'types';
import { ResourceLoader } from './ResourceLoader2';
import { ResourceValidation } from './ResourceValidation';
import {
  getInitialScanResult,
  ScanNamespaceStatus,
  ScanResourceStatus,
} from './ScanResult';

export class Scan {
  resourceLoader;
  result;
  constructor(resourceLoader: ResourceLoader, ruleset: ValidationSchema) {
    this.resourceLoader = resourceLoader;
    this.result = getInitialScanResult(ruleset);
  }

  async gatherAPIResources() {
    const apiResources = await this.resourceLoader.loadResourceLists();

    const listableResources = apiResources.filter(resource =>
      resource.verbs?.includes('list'),
    );
    const listableClusterResources = listableResources.filter(
      resource => !resource.namespaced,
    );
    const listableNamespaceResources = listableResources.filter(
      resource => resource.namespaced,
    );

    const clusterResourceStatus = listableClusterResources.map(resource => {
      return {
        kind: resource.kind,
        endpoint: `${resource.base}/${resource.name}`,
        scanned: false,
      };
    });

    this.result.resources = apiResources;
    this.result.cluster = {
      resources: clusterResourceStatus,
    };

    const namespaces = await this.resourceLoader.listNamespaces();

    const namespaceList = namespaces.map(
      ({ metadata: { name } }: K8sResource): ScanNamespaceStatus => {
        return {
          name,
          resources: listableNamespaceResources.map(resource => ({
            kind: resource.kind,
            endpoint: `${resource.base}/namespaces/${name}/${resource.name}`,
            scanned: false,
          })),
        };
      },
    ) as ScanNamespaceStatus[];

    this.result.namespaces = namespaceList.reduce((agg, curr) => {
      agg[curr.name] = curr;
      return agg;
    }, {} as { [key: string]: ScanNamespaceStatus });
  }

  async checkPermissions(post: PostFn, namespace?: string) {
    if (!this.result.cluster || !this.result.namespaces)
      throw new Error('call gatherAPIResources first');
    const scope = namespace
      ? this.result.namespaces[namespace]
      : this.result.cluster;

    scope.permissionSets = await getPermissionResourceRules(post, namespace);

    for (const resource of scope.resources) {
      const hasAccess = doesUserHavePermission(
        ['list'],
        { resourceGroupAndVersion: '', resourceKind: resource.kind },
        scope.permissionSets,
      );
      resource.unauthorized = !hasAccess;
    }

    if (!namespace) {
      for (const name of Object.keys(this.result.namespaces)) {
        await this.checkPermissions(post, name);
      }
    }
  }

  async scanResource(resource: ScanResourceStatus) {
    resource.items = [];

    try {
      for await (const items of this.resourceLoader.fetchPaginatedItems(
        resource.endpoint,
      )) {
        const pageWarnings = await ResourceValidation.validate(items);
        resource.items.push(
          ...items.map((item: any, i: number) => ({
            name: item.metadata.name,
            warnings: pageWarnings[i],
          })),
        );
      }
    } catch (error) {
      //
    }
    resource.scanned = true;
  }

  *listResourcesToScan() {
    if (!this.result.cluster || !this.result.namespaces)
      throw new Error('call gatherAPIResources first');

    yield* this.result.cluster.resources.filter(
      resource => !resource.scanned && !resource.unauthorized,
    );

    for (const { resources } of Object.values(this.result.namespaces)) {
      yield* resources.filter(
        resource => !resource.scanned && !resource.unauthorized,
      );
    }
  }
}
