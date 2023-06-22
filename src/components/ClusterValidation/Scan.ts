import PQueue from 'p-queue';
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
import { NamespacesState } from 'state/namespacesAtom';

export class Scan {
  resourceLoader;
  result;
  constructor(resourceLoader: ResourceLoader, ruleset: ValidationSchema) {
    this.resourceLoader = resourceLoader;
    this.result = getInitialScanResult(ruleset);
  }

  async gatherAPIResources({ namespaces }: { namespaces: NamespacesState }) {
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

    // const namespaces = await this.resourceLoader.listNamespaces();
    const namespaceNames = namespaces
      ? namespaces
      : ((await this.resourceLoader.listNamespaces()) as K8sResource[]).map(
          ({ metadata: { name } }) => name,
        );

    const namespaceList = namespaceNames.map(
      (name): ScanNamespaceStatus => {
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

  *filterResourcesForScan(resources: ScanResourceStatus[], filter?: string[]) {
    yield* resources.filter(
      resource =>
        !resource.scanned &&
        !resource.unauthorized &&
        (!filter || filter.includes(resource.kind)),
    );
  }

  *listResourcesToScan(filter?: {
    namespaces?: string[];
    resources?: string[];
  }) {
    if (!this.result.cluster || !this.result.namespaces)
      throw new Error('call gatherAPIResources first');

    yield* this.filterResourcesForScan(
      this.result.cluster.resources,
      filter?.resources,
    );

    const namespaces = Object.values(this.result.namespaces);
    const filteredNamespaces = filter?.namespaces
      ? namespaces.filter(({ name }) => filter.namespaces?.includes(name))
      : namespaces;

    for (const { resources } of filteredNamespaces) {
      yield* this.filterResourcesForScan(resources, filter?.resources);
    }
  }
}
