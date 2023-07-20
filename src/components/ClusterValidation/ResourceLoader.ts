import { K8sAPIResource } from 'types';
import PQueue from 'p-queue';

export class ResourceLoader {
  fetch;
  queue;
  cache;
  constructor(
    fetch: (endpoint: string) => any,
    queue: PQueue = new PQueue({ concurrency: 5 }),
    cache: Map<string, any> = new Map(),
  ) {
    this.fetch = fetch;
    this.queue = queue;
    this.cache = cache;
  }

  async _fetchData(endpoint: string) {
    const response = await this.fetch(endpoint);
    const data = await response.json();
    if (this.cache) {
      this.cache.set(endpoint, data);
    }
    return data;
  }

  async fetchData(endpoint: string) {
    if (this.cache && this.cache.has(endpoint)) {
      return this.cache.get(endpoint); // potentially with setImmediate to avoid event queue blocking
    } else if (this.queue) {
      return this.queue.add(() => this._fetchData(endpoint));
    } else {
      return this._fetchData(endpoint);
    }
  }

  async *fetchPaginatedItems(endpoint: string, chunkSize = 500) {
    let fullEndpoint = `${endpoint}?limit=${chunkSize}`;

    while (true) {
      const { items, metadata } = await this.fetchData(fullEndpoint);

      yield items;

      if (metadata.continue) {
        fullEndpoint = `${endpoint}?limit=${chunkSize}&continue=${metadata.continue}`;
      } else {
        break;
      }
    }
  }

  async *fetchResourceLists(): AsyncGenerator<K8sAPIResource[], any, void> {
    const { groups: customResourceGroups } = await this.fetchData('/apis');

    const groups = [
      '/api/v1',
      ...customResourceGroups.map(
        (g: any) => `/apis/${g.preferredVersion.groupVersion}`,
      ),
    ];

    const requests = groups.map(endpoint => ({
      endpoint,
      request: this.fetchData(endpoint),
    }));
    for (const { endpoint, request } of requests) {
      const { resources } = await request;
      yield resources.map((resource: any) => ({
        ...resource,
        base: endpoint,
      }));
    }
  }

  async loadResourceLists() {
    const resourceItems = [];
    for await (const resources of this.fetchResourceLists()) {
      for (const resource of resources) {
        resourceItems.push(resource);
      }
    }
    return resourceItems;
  }

  async listNamespaces() {
    const { items } = await this.fetchData('/api/v1/namespaces');
    return items;
  }
}
