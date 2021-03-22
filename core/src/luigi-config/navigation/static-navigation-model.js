import { config } from '../config';
import { getToken } from './navigation-helpers';
import { saveAs } from 'file-saver';

export const coreUIViewGroupName = '_core_ui_';
export const catalogViewGroupName = '_catalog_';

function toSearchParamsString(object) {
  return new URLSearchParams(object).toString();
}

export function getStaticChildrenNodesForNamespace(apiGroups) {
  const nodes = [
    {
      link: '/home/workspace',
      label: 'Back to Namespaces',
      icon: 'nav-back',
    },
    {
      category: {
        label: 'Workloads',
        icon: 'source-code',
        collapsible: true,
      },
      pathSegment: '_workloads_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Workloads',
      pathSegment: 'details',
      label: 'Overview',
      order: -1,
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
        }),
      icon: 'product',
      viewGroup: coreUIViewGroupName,
    },
    {
      category: 'Workloads',
      pathSegment: 'pods',
      label: 'Pods',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/pods?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      navigationContext: 'pods',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':podName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/pods/:podName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: 'Workloads',
      pathSegment: 'replicasets',
      label: 'Replica Sets',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/replicasets?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apps/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'replicasets',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':replicaSetName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/replicasets/:replicaSetName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apps/v1',
                }),
            },
          ],
        },
      ],
    },

    {
      category: 'Workloads',
      pathSegment: 'deployments',

      label: 'Deployments',
      keepSelectedForChildren: true,
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/deployments?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apps/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      navigationContext: 'deployments',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':deploymentName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/deployments/:deploymentName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apps/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: {
        label: 'Discovery and Network',
        icon: 'instance',
        collapsible: true,
      },
      pathSegment: '_discovery_and_network_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Discovery and Network',
      pathSegment: 'services',
      navigationContext: 'services',
      label: 'Services',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/services?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      navigationContext: 'services',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':serviceName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/services/:serviceName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: {
        label: 'Service Management',
        icon: 'add-coursebook',
        collapsible: true,
      },
      pathSegment: '_service_management_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: {
        label: 'Configuration',
        icon: 'key-user-settings',
        collapsible: true,
      },
      pathSegment: '_configuration_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Configuration',
      pathSegment: 'oauth2clients',
      navigationContext: 'oauth2clients',
      label: 'OAuth Clients',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/oauth2clients?' +
        toSearchParamsString({
          resourceApiPath: '/apis/hydra.ory.sh/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'create',
          viewUrl:
            config.coreUIModuleUrl +
            '/home/namespaces/:namespaceId/oauth-clients/create',
          viewGroup: coreUIViewGroupName,
        },
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':clientName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/oauth2clients/:clientName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/hydra.ory.sh/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'addons',
      navigationContext: 'addons',
      label: 'Addons',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/AddonsConfigurations?' +
        toSearchParamsString({
          resourceApiPath: '/apis/addons.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':addonName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/AddonsConfigurations/:addonName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/addons.kyma-project.io/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'roles',
      navigationContext: 'roles',
      label: 'Roles',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/roles?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':roleName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/roles/:roleName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Workloads',
      pathSegment: 'functions',
      navigationContext: 'functions',
      label: 'Functions',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/functions?' +
        toSearchParamsString({
          resourceApiPath: '/apis/serverless.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':functionName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/functions/:functionName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/serverless.kyma-project.io/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'gitrepositories',
      navigationContext: 'gitrepositories',
      label: 'Git Repositories',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/gitrepositories?' +
        toSearchParamsString({
          resourceApiPath: '/apis/serverless.kyma-project.io/v1alpha1',
          hasDetailsView: false,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
    },
    {
      category: 'Configuration',
      pathSegment: 'role-bindings',
      navigationContext: 'role-bindings',
      label: 'Role Bindings',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/rolebindings?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':roleBindingName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/rolebindings/:roleBindingName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'secrets',
      navigationContext: 'secrets',
      label: 'Secrets',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/secrets?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':name',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/secrets/:name?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'config-maps',
      navigationContext: 'config-maps',
      label: 'Config Maps',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/configmaps?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':name',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/configmaps/:name?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: 'Service Management',
      pathSegment: 'brokers',
      navigationContext: 'brokers',
      label: 'Brokers',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/servicebrokers?' +
        toSearchParamsString({
          resourceApiPath: '/apis/servicecatalog.k8s.io/v1beta1',
          hasDetailsView: false,
        }),
      viewGroup: coreUIViewGroupName,
    },
    {
      category: 'Service Management',
      pathSegment: 'catalog',
      navigationContext: 'catalog',
      label: 'Catalog',
      viewUrl: config.serviceCatalogModuleUrl + '/catalog',
      keepSelectedForChildren: true,
      viewGroup: catalogViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':serviceId',
              viewUrl:
                config.serviceCatalogModuleUrl + '/catalog/details/:serviceId',
              children: [
                {
                  pathSegment: 'plans',
                  viewUrl:
                    config.serviceCatalogModuleUrl +
                    '/catalog/details/:serviceId/plans',
                },
                {
                  pathSegment: 'plan',
                  children: [
                    {
                      pathSegment: ':planId',
                      viewUrl:
                        config.serviceCatalogModuleUrl +
                        '/catalog/details/:serviceId/plan/:planId',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      category: 'Service Management',
      pathSegment: 'instances',
      navigationContext: 'instances',
      label: 'Instances',
      viewUrl: config.serviceCatalogModuleUrl + '/instances',
      viewGroup: catalogViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':instanceName',
              viewUrl:
                config.serviceCatalogModuleUrl +
                '/instances/details/:instanceName',
            },
          ],
        },
      ],
    },
    {
      category: 'Discovery and Network',
      pathSegment: 'apirules',
      navigationContext: 'apirules',
      label: 'API Rules',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/apirules?' +
        toSearchParamsString({
          resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':apiName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/apirules/:apiName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
                }),
            },
          ],
        },
        {
          pathSegment: 'create',
          viewUrl:
            config.coreUIModuleUrl +
            '/apirules/create?' +
            toSearchParamsString({
              resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
              hasDetailsView: true,
            }),
        },
        {
          pathSegment: 'edit/:apiName',
          viewUrl:
            config.coreUIModuleUrl +
            '/apirules/edit/:apiName?' +
            toSearchParamsString({
              resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
              hasDetailsView: true,
            }),
        },
      ],
    },
    {
      category: { label: 'Experimental', icon: 'lab', collapsible: true },
      hideFromNav: true,
    },
  ];
  filterNodesByAvailablePaths(nodes, apiGroups);
  return nodes;
}

export function getStaticRootNodes(namespaceChildrenNodesResolver, apiGroups) {
  const nodes = [
    {
      pathSegment: 'workspace',
      label: 'Namespaces',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      icon: 'dimension',
      viewGroup: coreUIViewGroupName,
    },
    {
      pathSegment: 'namespaces',
      viewUrl: config.coreUIModuleUrl + '/namespaces',
      hideFromNav: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: ':namespaceId',
          context: {
            namespaceId: ':namespaceId',
            environmentId: ':namespaceId',
          },
          children: () => namespaceChildrenNodesResolver(apiGroups),
          navigationContext: 'namespaces',
          defaultChildNode: 'details',
        },
      ],
    },
    {
      category: {
        label: 'Integration',
        icon: 'overview-chart',
        collapsible: true,
      },
      pathSegment: '_integration_category_placeholder_',
      hideFromNav: true,
    },
    {
      pathSegment: 'preferences',
      navigationContext: 'settings',
      viewUrl: config.coreUIModuleUrl + '/preferences',
      viewGroup: coreUIViewGroupName,
      hideFromNav: true,
    },
    {
      category: 'Integration',
      pathSegment: 'cluster-brokers',
      navigationContext: 'cluster-roles',
      label: 'Cluster Brokers',
      viewUrl:
        config.coreUIModuleUrl +
        '/clusterservicebrokers?' +
        toSearchParamsString({
          resourceApiPath: '/apis/servicecatalog.k8s.io/v1beta1',
          hasDetailsView: true,
        }),
    },
    {
      pathSegment: 'cluster-roles',
      navigationContext: 'cluster-roles',
      label: 'Cluster Roles',
      category: {
        label: 'Administration',
        icon: 'settings',
        collapsible: true,
      },
      viewUrl:
        config.coreUIModuleUrl +
        '/clusterroles?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
          // limit: 2
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':roleName',
              viewUrl:
                config.coreUIModuleUrl +
                '/clusterroles/:roleName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
      requiredPermissions: [
        {
          apiGroup: 'rbac.authorization.k8s.io',
          resource: 'clusterrolebindings',
          verbs: ['create'],
        },
      ],
    },
    {
      pathSegment: 'cluster-role-bindings',
      navigationContext: 'cluster-role-bindings',
      label: 'Cluster Role Bindings',
      category: {
        label: 'Administration',
        icon: 'settings',
        collapsible: true,
      },
      viewUrl:
        config.coreUIModuleUrl +
        '/clusterrolebindings?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,

      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':clusterRoleBindingName',
              viewUrl:
                config.coreUIModuleUrl +
                '/clusterrolebindings/:clusterRoleBindingName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      pathSegment: 'addons-config',
      navigationContext: 'addons-config',
      label: 'Cluster Addons',
      category: {
        label: 'Integration',
        icon: 'settings',
        collapsible: true,
      },
      viewUrl:
        config.coreUIModuleUrl +
        '/ClusterAddonsConfigurations?' +
        toSearchParamsString({
          resourceApiPath: '/apis/addons.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':addonName',
              viewUrl:
                config.coreUIModuleUrl +
                '/ClusterAddonsConfigurations/:addonName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/addons.kyma-project.io/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      pathSegment: 'applications',
      navigationContext: 'applications',
      label: 'Applications/Systems',
      category: 'Integration',
      viewUrl:
        config.coreUIModuleUrl +
        '/applications?' +
        toSearchParamsString({
          resourceApiPath:
            '/apis/applicationconnector.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':name',
              viewUrl:
                config.coreUIModuleUrl +
                '/applications/:name?' +
                toSearchParamsString({
                  resourceApiPath:
                    '/apis/applicationconnector.kyma-project.io/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: {
        label: 'Diagnostics',
        icon: 'electrocardiogram',
        collapsible: true,
      },
      pathSegment: '_integration_category_placeholder_',
      hideFromNav: false,
    },
    {
      label: 'Logs',
      category: 'Diagnostics',
      viewUrl: '',
      externalLink: {
        url:
          'https://grafana.kyma0.hasselhoff.shoot.canary.k8s-hana.ondemand.com/explore?left=%5B"now-1h","now","Loki",%7B%7D,%7B"mode":"Logs"%7D,%7B"ui":%5Btrue,true,true,"none"%5D%7D%5D',
      },
    },
    {
      label: 'Metrics',
      category: 'Diagnostics',
      viewUrl: '',
      externalLink: {
        url:
          'https://grafana.kyma0.hasselhoff.shoot.canary.k8s-hana.ondemand.com',
      },
    },
    {
      label: 'Traces',
      category: 'Diagnostics',
      viewUrl: '',
      externalLink: {
        url:
          'https://jaeger.kyma0.hasselhoff.shoot.canary.k8s-hana.ondemand.com',
      },
    },
    {
      label: 'Service Mesh',
      category: 'Diagnostics',
      viewUrl: '',
      externalLink: {
        url:
          'https://kiali.kyma0.hasselhoff.shoot.canary.k8s-hana.ondemand.com',
      },
    },
    {
      pathSegment: 'logs',
      label: 'Logs',
      category: 'Diagnostics',
      viewUrl:
        config.logsModuleUrl +
        '/?function={nodeParams.function}&pod={nodeParams.pod}&namespace={nodeParams.namespace}&container_name={nodeParams.container_name}', // todo handle when logs are reintroduced
      hideFromNav: true,
    },
    {
      category: { label: 'Experimental', icon: 'lab', collapsible: true },
      hideFromNav: true,
    },
  ];
  filterNodesByAvailablePaths(nodes, apiGroups);
  return nodes;
}

function filterNodesByAvailablePaths(nodes, apiGroups) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (typeof node.children === 'object') {
      filterNodesByAvailablePaths(node.children, apiGroups);
    }
    if (!node.viewUrl) continue;
    const apiPath = new URL(node.viewUrl).searchParams.get('resourceApiPath');
    if (!apiPath) continue;

    if (!apiGroups.includes(apiPath)) {
      nodes.splice(i, 1);
    }
  }
}
