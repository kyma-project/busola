import i18next from 'i18next';
import { saveAs } from 'file-saver';

import { config } from '../config';
import { getActiveClusterName, getClusters } from './../cluster-management';
import { hasPermissionsFor } from './permissions';

export const coreUIViewGroupName = '_core_ui_';
export const catalogViewGroupName = '_catalog_';

async function importJsYaml() {
  return (await import('js-yaml')).default;
}

function toSearchParamsString(object) {
  return new URLSearchParams(object).toString();
}
async function downloadKubeconfig() {
  const jsyaml = await importJsYaml();

  const clusterName = getActiveClusterName();
  const clusters = await getClusters();
  if (clusterName && clusters && clusters[clusterName]) {
    try {
      const { kubeconfig } = clusters[clusterName];
      if (!kubeconfig) {
        Luigi.ux().showAlert({
          text: `Failed to dowload the Kubeconfig due to: Kubeconfig is missing on the Cluster`,
          type: 'error',
        });
        return false;
      }
      const kubeconfigYaml = jsyaml.dump(kubeconfig);
      const blob = new Blob([kubeconfigYaml], {
        type: 'application/yaml;charset=utf-8',
      });
      saveAs(blob, 'kubeconfig.yaml');
    } catch (e) {
      console.error(e);
      Luigi.ux().showAlert({
        text: `Failed to dowload the Kubeconfig due to: ${e.message}`,
        type: 'error',
      });
    }
  }

  return false; // cancel Luigi navigation
}

export function getStaticChildrenNodesForNamespace(
  apiPaths,
  permissionSet,
  features,
) {
  const encodedClusterName = encodeURIComponent(getActiveClusterName());
  const nodes = [
    {
      link: `/cluster/${encodedClusterName}/namespaces`,
      label: i18next.t('namespaces.overview.back'),
      icon: 'nav-back',
      hideFromNav: !hasPermissionsFor('', 'namespaces', permissionSet, [
        'list',
      ]),
    },
    {
      pathSegment: 'details',
      label: i18next.t('namespaces.overview.title'),
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
        label: i18next.t('namespaces.workloads.title'),
        icon: 'source-code',
        collapsible: true,
      },
      pathSegment: '_workloads_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Workloads',
      resourceType: 'functions',
      pathSegment: 'functions',
      navigationContext: 'functions',
      label: i18next.t('namespaces.workloads.functions.title'),
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
        requiredFeatures: [features.SERVERLESS],
      },
      children: [
        {
          pathSegment: 'details',
          resourceType: 'functions',
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
      resourceType: 'pods',
      label: i18next.t('namespaces.workloads.pods.title'),
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
              resourceType: 'pods',
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
      resourceType: 'deployments',

      label: i18next.t('namespaces.workloads.deployments.title'),
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
              resourceType: 'deployments',
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
      resourceType: 'replicasets',
      pathSegment: 'replicasets',
      label: i18next.t('namespaces.workloads.replica_sets.title'),
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
              resourceType: 'replicasets',
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
        label: i18next.t('namespaces.discovery-and-network.title'),
        icon: 'instance',
        collapsible: true,
      },
      pathSegment: '_discovery_and_network_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Discovery and Network',
      resourceType: 'apirules',
      pathSegment: 'apirules',
      navigationContext: 'apirules',
      label: i18next.t('namespaces.discovery-and-network.api-rules.title'),
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
        requiredFeatures: [features.API_GATEWAY],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':apiName',
              resourceType: 'apirules',
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
      resourceType: 'services',
      navigationContext: 'services',
      label: i18next.t('namespaces.discovery-and-network.services.title'),
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
              resourceType: 'services',
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
        label: i18next.t('namespaces.service-management.title'),
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
      label: i18next.t('namespaces.service-management.catalog.menu-title'),
      viewUrl: config.serviceCatalogModuleUrl + '/catalog',
      keepSelectedForChildren: true,
      viewGroup: catalogViewGroupName,
      context: {
        requiredFeatures: [features.SERVICE_CATALOG],
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
      label: i18next.t('namespaces.service-management.instances.title'),
      viewUrl: config.serviceCatalogModuleUrl + '/instances',
      viewGroup: catalogViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.SERVICE_CATALOG],
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
      label: i18next.t('namespaces.service-management.brokers.title'),
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
        requiredFeatures: [features.SERVICE_CATALOG],
      },
    },

    //CONFIGURATION CATEGORY (NAMESPACE)
    {
      category: {
        label: i18next.t('namespaces.configuration.title'),
        icon: 'settings',
        collapsible: true,
      },
      pathSegment: '_configuration_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Configuration',
      pathSegment: 'addons',
      resourceType: 'addonsconfigurations',
      navigationContext: 'addonsconfigurations',
      label: i18next.t('namespaces.configuration.addons.title'),
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
        requiredFeatures: [features.ADDONS],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':addonName',
              resourceType: 'addonsconfigurations',
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
      resourceType: 'configmaps',
      navigationContext: 'configmaps',
      label: i18next.t('namespaces.configuration.config-maps.title'),
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
              resourceType: 'configmaps',
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
      resourceType: 'secrets',
      pathSegment: 'secrets',
      navigationContext: 'secrets',
      label: i18next.t('namespaces.configuration.secrets.title'),
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
              resourceType: 'secrets',
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
      resourceType: 'roles',
      navigationContext: 'roles',
      label: i18next.t('namespaces.configuration.roles.title'),
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
              resourceType: 'roles',
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
      resourceType: 'rolebindings',
      navigationContext: 'rolebindings',
      label: i18next.t('namespaces.configuration.role-bindings.title'),
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
              resourceType: 'rolebindings',
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
      resourceType: 'oauth2clients',
      navigationContext: 'oauth2clients',
      label: i18next.t('namespaces.configuration.oauth2-clients.title'),
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
              resourceType: 'oauth2clients',
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
      resourceType: 'gitrepositories',
      navigationContext: 'gitrepositories',
      label: i18next.t('namespaces.configuration.git-repositories.title'),
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
        requiredFeatures: [features.SERVERLESS],
      },
    },
    {
      category: 'Configuration',
      pathSegment: 'customresourcedefinitions',
      resourceType: 'customresourcedefinitions',
      navigationContext: 'customresourcedefinitions',
      label: i18next.t(
        'namespaces.configuration.custom-resource-definitions.title',
      ),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/CustomResourceDefinitions?' +
        toSearchParamsString({
          fullResourceApiPath:
            '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':CustomResourceDefinitionName',
              resourceType: 'customresourcedefinitions',
              navigationContext: 'customresourcedefinition',
              viewUrl:
                config.coreUIModuleUrl +
                '/CustomResourceDefinitions/:CustomResourceDefinitionName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apiextensions.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
              children: [
                {
                  pathSegment: ':resourceVersion',
                  children: [
                    {
                      pathSegment: ':resourceName',
                      resourceType: 'customresource',
                      navigationContext: 'customresource',
                      viewUrl:
                        config.coreUIModuleUrl +
                        '/CustomResourceDefinitions/:CustomResourceDefinitionName/:resourceVersion/:resourceName',
                      viewGroup: coreUIViewGroupName,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  filterNodesByAvailablePaths(nodes, apiPaths, permissionSet);
  return nodes;
}

export function getStaticRootNodes(
  namespaceChildrenNodesResolver,
  apiPaths,
  permissionSet,
  features,
) {
  const nodes = [
    {
      pathSegment: 'overview',
      label: i18next.t('clusters.overview.title.message'),
      icon: 'database',
      viewUrl: config.coreUIModuleUrl + '/overview',
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'nodes',
          children: [
            {
              pathSegment: ':nodeName',
              viewUrl: config.coreUIModuleUrl + '/overview/nodes/:nodeName',
            },
          ],
        },
      ],
    },
    {
      pathSegment: 'namespaces',
      resourceType: 'namespaces',
      label: i18next.t('namespaces.title'),
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
          resourceType: 'namespaces',
          pathSegment: ':namespaceId',
          context: {
            namespaceId: ':namespaceId',
          },
          keepSelectedForChildren: false,
          children: async () =>
            await namespaceChildrenNodesResolver(
              apiPaths,
              permissionSet,
              features,
            ),
          defaultChildNode: 'details',
        },
      ],
    },

    //INTEGRATION CATEGORY
    {
      category: {
        label: i18next.t('integration.title'),
        icon: 'overview-chart',
        collapsible: true,
      },
      pathSegment: '_integration_category_placeholder_',
      hideFromNav: true,
    },
    {
      pathSegment: 'applications',
      resourceType: 'applications',
      navigationContext: 'applications',
      label: i18next.t('integration.applications.title'),
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
        requiredFeatures: [features.APPLICATIONS],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':name',
              resourceType: 'applications',
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
      pathSegment: 'addons-config',
      navigationContext: 'clusteraddonsconfigurations',
      resourceType: 'clusteraddonsconfigurations',
      label: i18next.t('integration.cluster-addons.title'),
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
        requiredFeatures: [features.ADDONS],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':addonName',
              resourceType: 'clusteraddonsconfigurations',
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

    //CONFIGURATION CATEGORY (CLUSTER)
    {
      category: {
        label: i18next.t('configuration.title'),
        icon: 'settings',
        collapsible: true,
      },
      pathSegment: '_configuration_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: 'Configuration',
      pathSegment: 'cluster-roles',
      navigationContext: 'clusterroles',
      resourceType: 'clusterroles',
      label: i18next.t('configuration.cluster-roles.title'),
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
              resourceType: 'clusterroles',
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
      resourceType: 'clusterrolebindings',
      navigationContext: 'clusterrolebindings',
      label: i18next.t('configuration.cluster-role-bindings.title'),
      category: 'Configuration',
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
              resourceType: 'clusterrolebindings',
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
    {
      category: 'Configuration',
      pathSegment: 'customresourcedefinitions',
      resourceType: 'customresourcedefinitions',
      navigationContext: 'customresourcedefinitions',
      label: i18next.t('configuration.custom-resource-definitions.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/CustomResourceDefinitions?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apiextensions.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':CustomResourceDefinitionName',
              resourceType: 'customresourcedefinitions',
              navigationContext: 'customresourcedefinition',
              viewUrl:
                config.coreUIModuleUrl +
                '/CustomResourceDefinitions/:CustomResourceDefinitionName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apiextensions.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
              children: [
                {
                  pathSegment: ':resourceVersion',
                  children: [
                    {
                      pathSegment: ':resourceName',
                      resourceType: 'customresource',
                      navigationContext: 'customresource',
                      viewUrl:
                        config.coreUIModuleUrl +
                        '/CustomResourceDefinitions/:CustomResourceDefinitionName/:resourceVersion/:resourceName',
                      viewGroup: coreUIViewGroupName,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // OTHER
    {
      pathSegment: 'preferences',
      viewUrl: config.coreUIModuleUrl + '/preferences',
      viewGroup: coreUIViewGroupName,
      hideFromNav: true,
    },
    {
      pathSegment: 'download-kubeconfig',
      navigationContext: 'kubeconfig',
      hideFromNav: true,
      onNodeActivation: downloadKubeconfig,
    },
  ];
  filterNodesByAvailablePaths(nodes, apiPaths, permissionSet);
  return nodes;
}

function extractApiGroup(apiPath) {
  if (apiPath === '/api/v1') {
    return ''; // core api group
  }
  return apiPath.split('/')[2];
}

function filterNodesByAvailablePaths(nodes, apiPaths, permissionSet) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (typeof node.children === 'object') {
      filterNodesByAvailablePaths(node.children, apiPaths, permissionSet);
    }

    const removeNode = () => nodes.splice(i, 1);
    checkSingleNode(node, apiPaths, permissionSet, removeNode);
  }
}

function checkSingleNode(node, apiPaths, permissionSet, removeNode) {
  if (!node.viewUrl || !node.resourceType) return;
  const apiPath = new URL(node.viewUrl).searchParams.get('resourceApiPath');
  if (!apiPath) return;

  if (apiPaths) {
    // we have '*' in permissions, just check if this resource exists
    if (!apiPaths.includes(apiPath)) {
      removeNode();
    }
  } else {
    // we need to filter through permissions to check the node availability
    const apiGroup = extractApiGroup(apiPath);
    if (!hasPermissionsFor(apiGroup, node.resourceType, permissionSet)) {
      removeNode();
    }
  }
}
