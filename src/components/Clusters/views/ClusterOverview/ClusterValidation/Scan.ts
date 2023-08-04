import { PostFn } from 'shared/hooks/BackendAPI/usePost';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import { getPermissionResourceRules } from 'state/permissionSetsSelector';
import { ValidationSchema } from 'state/validationSchemasAtom';
import { K8sAPIResource, K8sResource } from 'types';
import { ResourceLoader } from './ResourceLoader';
import { ResourceValidation } from './ResourceValidation';
import {
  getInitialScanResult,
  ScanNamespaceStatus,
  ScanResourceStatus,
  ScanResult,
  ScanResultSummary,
} from './ScanResult';
import { NamespacesState } from 'state/namespacesAtom';
import PQueue from 'p-queue';

const sum = (summed: number, x: number) => summed + x;

export type ScanProgress =
  | {
      total?: number;
      scanned?: number;
    }
  | undefined;

export class Scan {
  resourceLoader;
  result;
  abortHandlers: (() => void)[];
  constructor(resourceLoader: ResourceLoader, ruleset: ValidationSchema) {
    this.resourceLoader = resourceLoader;
    this.result = getInitialScanResult(ruleset);
    this.abortHandlers = [];
  }

  async gatherAPIResources({
    namespaces,
    resources,
  }: {
    namespaces: NamespacesState;
    resources: K8sAPIResource[];
  }) {
    const apiResources = resources
      ? resources
      : await this.resourceLoader.loadResourceLists();

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

  initSummary() {
    this.result.summary = {
      children: [],
    };
    this.result.namespaceSummary = {
      parent: this.result.summary,
    };
    const { cluster, namespaces } = this.result;
    if (cluster) {
      cluster.summary = {
        parent: this.result.summary,
      };

      for (const resource of cluster.resources) {
        resource.summary = {
          parent: cluster.summary,
          resource,
        };
      }
      cluster.summary.children = cluster.resources.map(
        ({ summary }) => summary,
      ) as ScanResultSummary[];
      this.result.summary.children?.push(cluster.summary);
    }

    if (namespaces) {
      for (const namespace of Object.values(namespaces)) {
        namespace.summary = {
          parent: this.result.namespaceSummary,
        };

        for (const resource of namespace.resources) {
          resource.summary = {
            parent: namespace.summary,
            resource,
          };
        }
        namespace.summary.children = namespace.resources.map(
          ({ summary }) => summary,
        ) as ScanResultSummary[];
      }
      this.result.namespaceSummary.children = Object.values(namespaces).map(
        ({ summary }) => summary,
      ) as ScanResultSummary[];
      this.result.summary?.children?.push(this.result.namespaceSummary);
    }
  }

  calculateResourceSummary(resource: ScanResourceStatus) {
    const summary = resource.summary;
    if (summary) {
      summary.warningCount = (
        resource.items?.map(item => item.warnings?.length ?? 0) ?? []
      ).reduce(sum, 0);
      summary.scanned = resource.scanned ? 1 : 0;
      summary.unauthorized = resource.unauthorized ? 1 : 0;
      summary.resourceCount = 1;
    }
  }

  calculateShallowSummary(summary: ScanResultSummary) {
    if (summary.children) {
      summary.warningCount = summary.children
        .map(({ warningCount }) => warningCount ?? 0)
        .reduce(sum, 0);
      summary.scanned = summary.children
        .map(({ scanned }) => scanned ?? 0)
        .reduce(sum, 0);
      summary.unauthorized = summary.children
        .map(({ unauthorized }) => unauthorized ?? 0)
        .reduce(sum, 0);
      summary.resourceCount = summary.children
        .map(({ resourceCount }) => resourceCount ?? 0)
        .reduce(sum, 0);
    }
  }

  calculateFullSummary(summary: ScanResultSummary) {
    if (summary.resource) {
      this.calculateResourceSummary(summary.resource);
      return;
    }

    summary.children?.forEach(child => {
      this.calculateFullSummary(child);
    });
    this.calculateShallowSummary(summary);
  }

  recalculateSummary(summary: ScanResultSummary) {
    if (summary.resource) {
      this.calculateResourceSummary(summary.resource);
    } else {
      this.calculateShallowSummary(summary);
    }

    if (summary.parent) {
      this.recalculateSummary(summary.parent);
    }
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
        {
          resourceGroupAndVersion: '',
          resourceKind: resource.kind.toLowerCase(),
        },
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
      resource.scanned = true;
    } catch (error) {
      console.error(
        `error during scan of resource ${resource.endpoint}: ${error}`,
      );
    }
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

  async scan({
    namespaces,
    resources,
    setScanProgress,
    setScanResult,
    post,
    concurrency,
  }: {
    namespaces: string[];
    resources: K8sAPIResource[];
    setScanProgress: (progress: ScanProgress) => void;
    setScanResult: (result: ScanResult) => void;
    post: PostFn;
    concurrency: number;
  }) {
    let aborted = false;
    this.abortHandlers.push(() => (aborted = true));

    setScanProgress({});
    setScanResult(this.result);

    await this.gatherAPIResources({
      namespaces,
      resources,
    });
    if (aborted) return;
    setScanResult(this.result);

    await this.checkPermissions(post);
    if (aborted) return;
    setScanResult(this.result);

    this.initSummary();
    if (this.result.summary) this.calculateFullSummary(this.result.summary);
    if (aborted) return;
    setScanResult(this.result);

    let countScanned = 0;
    const queue = new PQueue({ concurrency });
    const toScan = [...this.listResourcesToScan()];
    if (aborted) return;
    setScanProgress({ total: toScan.length });

    await Promise.all(
      toScan.map(async resource =>
        queue.add(async () => {
          await this.scanResource(resource);
          if (aborted) {
            queue.clear();
            return;
          }
          if (resource.summary) this.recalculateSummary(resource.summary);
          countScanned++;
          setScanProgress({ total: toScan.length, scanned: countScanned });
          setScanResult(this.result);
        }),
      ),
    );
  }

  abort() {
    this.abortHandlers.forEach(abort => abort());
    this.abortHandlers.length = 0;
  }
}
