import loki, { Collection } from 'lokijs';
import { K8sAPIResource } from 'types';

interface K8sGroup {
  name: string;
  endpoint: string;
}

interface APIResource {
  name: string;
  namespaced: boolean;
  kind: string;
  verbs: string[];
  base: string;
  collectionName?: string;
  revision?: string;
}

export class ResourceLoader {
  db;
  fetch;
  constructor(fetch: (endpoint: string) => any) {
    this.fetch = fetch;
    this.db = new loki('resources.db');
    // @ts-ignore
    window.db = this.db;
  }

  async fetchData(endpoint: string) {
    const response = await this.fetch(endpoint);
    const data = await response.json();
    return data;
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

    console.log(groups);
    for (const endpoint of groups) {
      console.log(endpoint);
      const { resources } = await this.fetchData(endpoint);
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

  async *fetchResources(name = 'pods', namespace = 'default') {
    const resourceItems = this.db.getCollection('resources') as Collection<
      APIResource
    >;
    const resourceItem = resourceItems.findOne({ name });
    if (!resourceItem) throw new Error(`No Resource ${name} found`);

    if (resourceItem.namespaced) {
      const baseEndpoint = `${resourceItem.base}/namespaces/${namespace}/${resourceItem.name}`;
      for await (const items of this.fetchPaginatedItems(baseEndpoint)) {
        yield items;
      }
    }
  }

  async loadResources(name = 'pods', namespace = 'default') {
    let collection = this.db.getCollection(name);
    if (!collection) {
      collection = this.db.addCollection(name);
    }

    for await (const items of this.fetchResources(name, namespace)) {
      for (const item of items) {
        collection.add(item);
      }
    }

    return collection.find();
  }

  async listNamespaces() {
    const { items } = await this.fetchData('/api/v1/namespaces');
    return items;
  }
}
