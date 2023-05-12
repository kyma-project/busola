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
  fetch;
  constructor(fetch: (endpoint: string) => any) {
    this.fetch = fetch;
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

  async listNamespaces() {
    const { items } = await this.fetchData('/api/v1/namespaces');
    return items;
  }
}
