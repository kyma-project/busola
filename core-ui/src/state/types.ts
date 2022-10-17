export type ExtResource = {
  general: {
    resource: {
      kind: string;
      group: string;
      version: string;
    };
    name: string;
    category: string;
    urlPath: string;
    scope: 'namespace' | 'cluster';
    description?: string;
  };
  list: any[];
  details: {
    header: any[];
    body: any[];
  };
  form: any[];
  translations: Record<string, any>;
  presets: any[];
  dataSources: Record<string, any>;
};

export type NavNode = {
  resourceType: string; // Jobs
  category: string;
  namespaced: boolean;
  label: string; // // może być opcjonalnie, ma byc tylko jak jest inny od resourceType
  pathSegment: string; // może być opcjonalnie, ma byc tylko jak jest inny od resourceType, pathSegemnt to urlPath w ext config
};
