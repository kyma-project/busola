import { config } from '../config';
import { getActiveClusterName } from './../cluster-management';

export const coreUIViewGroupName = '_core_ui_';
export const catalogViewGroupName = '_catalog_';

function toSearchParamsString(object) {
  return new URLSearchParams(object).toString();
}

export function getStaticChildrenNodesForNamespace(apiGroups, modules) {
  const encodedClusterName = encodeURIComponent(getActiveClusterName());
  const nodes = [
    {
      link: `/cluster/${encodedClusterName}/namespaces`,
      label: 'Back to Namespaces',
      icon: 'nav-back',
    },
    {
      pathSegment: 'details',
      label: 'Overview',
      viewUrl:
        config.coreUIModuleUrl +
        '/Namespaces/:namespaceId?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
        }),
      icon: 'product',
      viewGroup: coreUIViewGroupName,
    },

    //WORKLOADS CATEGORY
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
      pathSegment: 'functions',
      navigationContext: 'functions',
      label: 'Functions',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Functions?' +
        toSearchParamsString({
          resourceApiPath: '/apis/serverless.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredModules: [modules?.SERVERLESS],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':functionName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/Functions/:functionName?' +
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
      category: 'Workloads',
      pathSegment: 'pods',
      label: 'Pods',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Pods?' +
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
                '/namespaces/:namespaceId/Pods/:podName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              navigationContext: 'pod',
              children: [
                {
                  navigationContext: 'containers',
                  pathSegment: 'containers',
                  children: [
                    {
                      pathSegment: ':containerName',
                      viewUrl:
                        config.coreUIModuleUrl +
                        '/namespaces/:namespaceId/Pods/:podName/Containers/:containerName',
                    },
                  ],
                },
                {
                  pathSegment: 'initContainers',
                  navigationContext: 'init-containers',
                  children: [
                    {
                      pathSegment: ':containerName',
                      viewUrl:
                        config.coreUIModuleUrl +
                        '/namespaces/:namespaceId/Pods/:podName/InitContainers/:containerName',
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
      category: 'Workloads',
      pathSegment: 'deployments',

      label: 'Deployments',
      keepSelectedForChildren: true,
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Deployments?' +
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
                '/namespaces/:namespaceId/Deployments/:deploymentName?' +
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
      pathSegment: 'replicasets',
      label: 'Replica Sets',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ReplicaSets?' +
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
                '/namespaces/:namespaceId/ReplicaSets/:replicaSetName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apps/v1',
                }),
            },
          ],
        },
      ],
    },

    //DISCOVERY AND NETWORK CATEGORY
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
      pathSegment: 'apirules',
      navigationContext: 'apirules',
      label: 'API Rules',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ApiRules?' +
        toSearchParamsString({
          resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredModules: [modules?.API_GATEWAY],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':apiName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/ApiRules/:apiName?' +
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
            '/ApiRules/create?' +
            toSearchParamsString({
              resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
              hasDetailsView: true,
            }),
        },
        {
          pathSegment: 'edit/:apiName',
          viewUrl:
            config.coreUIModuleUrl +
            '/ApiRules/edit/:apiName?' +
            toSearchParamsString({
              resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
              hasDetailsView: true,
            }),
        },
      ],
    },
    {
      category: 'Discovery and Network',
      pathSegment: 'services',
      navigationContext: 'services',
      label: 'Services',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Services?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':serviceName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/Services/:serviceName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },

    //SERVICE MANAGEMENT CATEGORY
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
      category: 'Service Management',
      pathSegment: 'catalog',
      navigationContext: 'catalog',
      label: 'Catalog',
      viewUrl: config.serviceCatalogModuleUrl + '/catalog',
      keepSelectedForChildren: true,
      viewGroup: catalogViewGroupName,
      context: {
        requiredModules: [modules?.SERVICE_CATALOG],
      },
      children: [
        {
          pathSegment: 'ServiceClass',
          children: [
            {
              pathSegment: ':serviceId',
              viewUrl:
                config.serviceCatalogModuleUrl +
                '/catalog/ServiceClass/:serviceId',
              children: [
                {
                  pathSegment: 'plans',
                  viewUrl:
                    config.serviceCatalogModuleUrl +
                    '/catalog/ServiceClass/:serviceId/plans',
                },
                {
                  pathSegment: 'plan',
                  children: [
                    {
                      pathSegment: ':planId',
                      viewUrl:
                        config.serviceCatalogModuleUrl +
                        '/catalog/ServiceClass/:serviceId/plan/:planId',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          pathSegment: 'ClusterServiceClass',
          children: [
            {
              pathSegment: ':serviceId',
              viewUrl:
                config.serviceCatalogModuleUrl +
                '/catalog/ClusterServiceClass/:serviceId',
              children: [
                {
                  pathSegment: 'plans',
                  viewUrl:
                    config.serviceCatalogModuleUrl +
                    '/catalog/ClusterServiceClass/:serviceId/plans',
                },
                {
                  pathSegment: 'plan',
                  children: [
                    {
                      pathSegment: ':planId',
                      viewUrl:
                        config.serviceCatalogModuleUrl +
                        '/catalog/ClusterServiceClass/:serviceId/plan/:planId',
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
      context: {
        requiredModules: [modules?.SERVICE_CATALOG],
      },
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
      category: 'Service Management',
      pathSegment: 'brokers',
      navigationContext: 'brokers',
      label: 'Brokers',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ServiceBrokers?' +
        toSearchParamsString({
          resourceApiPath: '/apis/servicecatalog.k8s.io/v1beta1',
          readOnly: true,
          hasDetailsView: false,
        }),
      viewGroup: coreUIViewGroupName,
      context: {
        requiredModules: [modules?.SERVICE_CATALOG],
      },
    },

    //CONFIGURATION CATEGORY
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
      pathSegment: 'addons',
      navigationContext: 'addonsconfigurations',
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
      context: {
        requiredModules: [modules?.ADDONS],
      },
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
      pathSegment: 'config-maps',
      navigationContext: 'configmaps',
      label: 'Config Maps',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ConfigMaps?' +
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
                '/namespaces/:namespaceId/ConfigMaps/:name?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
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
        '/namespaces/:namespaceId/Secrets?' +
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
                '/namespaces/:namespaceId/Secrets/:name?' +
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
      pathSegment: 'roles',
      navigationContext: 'roles',
      label: 'Roles',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Roles?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
          readOnly: true,
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
                '/namespaces/:namespaceId/Roles/:roleName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                  readOnly: true,
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: 'Configuration',
      pathSegment: 'role-bindings',
      navigationContext: 'rolebindings',
      label: 'Role Bindings',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/RoleBindings?' +
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
                '/namespaces/:namespaceId/RoleBindings/:roleBindingName?' +
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
      pathSegment: 'oauth2clients',
      navigationContext: 'oauth2clients',
      label: 'OAuth Clients',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Oauth2Clients?' +
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
            '/namespaces/:namespaceId/oauth-clients/create',
          viewGroup: coreUIViewGroupName,
        },
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':clientName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/Oauth2Clients/:clientName?' +
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
      pathSegment: 'gitrepositories',
      navigationContext: 'gitrepositories',
      label: 'Git Repositories',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/GitRepositories?' +
        toSearchParamsString({
          resourceApiPath: '/apis/serverless.kyma-project.io/v1alpha1',
          hasDetailsView: false,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredModules: [modules?.SERVERLESS_REPOS],
      },
    },
  ];
  filterNodesByAvailablePaths(nodes, apiGroups);
  return nodes;
}

export function getStaticRootNodes(
  namespaceChildrenNodesResolver,
  apiGroups,
  modules
) {
  const nodes = [
    {
      pathSegment: 'namespaces',
      label: 'Namespaces',
      icon: 'dimension',
      viewUrl:
        config.coreUIModuleUrl +
        '/Namespaces?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      navigationContext: 'namespaces',
      children: [
        {
          navigationContext: 'namespace',
          pathSegment: ':namespaceId',
          context: {
            namespaceId: ':namespaceId',
          },
          keepSelectedForChildren: false,
          children: () => namespaceChildrenNodesResolver(apiGroups),
          defaultChildNode: 'details',
        },
      ],
    },

    //INTEGRATION CATEGORY
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
      pathSegment: 'applications',
      navigationContext: 'applications',
      label: 'Applications/Systems',
      category: 'Integration',
      viewUrl:
        config.coreUIModuleUrl +
        '/Applications?' +
        toSearchParamsString({
          resourceApiPath:
            '/apis/applicationconnector.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredModules: [modules?.APPLICATIONS],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':name',
              viewUrl:
                config.coreUIModuleUrl +
                '/Applications/:name?' +
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
      pathSegment: 'preferences',
      viewUrl: config.coreUIModuleUrl + '/preferences',
      viewGroup: coreUIViewGroupName,
      hideFromNav: true,
    },
    {
      pathSegment: 'addons-config',
      navigationContext: 'clusteraddonsconfigurations',
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
      context: {
        requiredModules: [modules?.ADDONS],
      },
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

    //ADMINISTRATION CATEGORY
    {
      pathSegment: 'cluster-roles',
      navigationContext: 'clusterroles',
      label: 'Cluster Roles',
      category: {
        label: 'Administration',
        icon: 'settings',
        collapsible: true,
      },
      viewUrl:
        config.coreUIModuleUrl +
        '/ClusterRoles?' +
        toSearchParamsString({
          resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
          hasDetailsView: true,
          readOnly: true,
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
                '/ClusterRoles/:roleName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                  readOnly: true,
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
      navigationContext: 'clusterrolebindings',
      label: 'Cluster Role Bindings',
      category: {
        label: 'Administration',
        icon: 'settings',
        collapsible: true,
      },
      viewUrl:
        config.coreUIModuleUrl +
        '/ClusterRoleBindings?' +
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
                '/ClusterRoleBindings/:clusterRoleBindingName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/rbac.authorization.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },

    //DIAGNOSTICS CATEGORY
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
