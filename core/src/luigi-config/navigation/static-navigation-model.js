import i18next from 'i18next';
import { saveAs } from 'file-saver';

import { config } from '../config';
import {
  getActiveClusterName,
  getClusters,
} from './../cluster-management/cluster-management';
import { hasPermissionsFor, hasWildcardPermission } from './permissions';
import { showAlert } from '../utils/showAlert';

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
        showAlert({
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
      showAlert({
        text: `Failed to dowload the Kubeconfig due to: ${e.message}`,
        type: 'error',
      });
    }
  }

  return false; // cancel Luigi navigation
}

export function getStaticChildrenNodesForNamespace(
  groupVersions,
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
        label: i18next.t('workloads.title'),
        icon: 'source-code',
        collapsible: true,
      },
      pathSegment: '_workloads_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: i18next.t('workloads.title'),
      resourceType: 'functions',
      pathSegment: 'functions',
      navigationContext: 'functions',
      label: i18next.t('functions.title'),
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
      category: i18next.t('workloads.title'),
      pathSegment: 'deployments',
      resourceType: 'deployments',

      label: i18next.t('deployments.title'),
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
      category: i18next.t('workloads.title'),
      resourceType: 'statefulsets',
      pathSegment: 'statefulsets',
      label: i18next.t('stateful-sets.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/statefulsets?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apps/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'statefulsets',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':statefulSetName',
              resourceType: 'statefulsets',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/statefulsets/:statefulSetName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apps/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('workloads.title'),
      resourceType: 'daemonsets',
      pathSegment: 'daemonsets',
      label: i18next.t('daemon-sets.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/DaemonSets?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apps/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'daemonsets',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':daemonSetName',
              resourceType: 'daemonsets',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/DaemonSets/:daemonSetName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apps/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('workloads.title'),
      resourceType: 'cronjobs',
      pathSegment: 'cronjobs',
      label: i18next.t('cron-jobs.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/cronjobs?' +
        toSearchParamsString({
          resourceApiPath: '/apis/batch/v1beta1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'cronjobs',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':cronJobName',
              resourceType: 'cronjobs',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/cronjobs/:cronJobName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/batch/v1beta1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('workloads.title'),
      resourceType: 'jobs',
      pathSegment: 'jobs',
      label: i18next.t('jobs.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/jobs?' +
        toSearchParamsString({
          resourceApiPath: '/apis/batch/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'jobs',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':jobName',
              resourceType: 'jobs',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/jobs/:jobName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/batch/v1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('workloads.title'),
      resourceType: 'replicasets',
      pathSegment: 'replicasets',
      label: i18next.t('replica-sets.title'),
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
    {
      category: i18next.t('workloads.title'),
      pathSegment: 'pods',
      resourceType: 'pods',
      label: i18next.t('pods.title'),
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

    //DISCOVERY AND NETWORK CATEGORY
    {
      category: {
        label: i18next.t('discovery-and-network.title'),
        icon: 'instance',
        collapsible: true,
      },
      pathSegment: '_discovery_and_network_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: i18next.t('discovery-and-network.title'),
      resourceType: 'apirules',
      pathSegment: 'apirules',
      navigationContext: 'apirules',
      label: i18next.t('api-rules.title'),
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
      category: i18next.t('discovery-and-network.title'),
      pathSegment: 'services',
      resourceType: 'services',
      navigationContext: 'services',
      label: i18next.t('services.title'),
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

    // ISTIO
    {
      category: {
        label: i18next.t('istio.title'),
        icon: 'overview-chart',
        collapsible: true,
      },
      pathSegment: '_istio_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: i18next.t('istio.title'),
      resourceType: 'gateways',
      pathSegment: 'gateways',
      label: i18next.t('gateways.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/gateways?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.istio.io/v1alpha3',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.ISTIO],
      },

      navigationContext: 'gateways',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':gatewayName',
              resourceType: 'gateways',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/gateways/:gatewayName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/networking.istio.io/v1beta1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('istio.title'),
      resourceType: 'destinationrules',
      pathSegment: 'destinationrules',
      label: i18next.t('destination-rules.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/destinationRules?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.istio.io/v1alpha3',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.ISTIO],
      },

      navigationContext: 'destinationrules',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':destinationRuleName',
              resourceType: 'destinationrules',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/destinationRules/:destinationRuleName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/networking.istio.io/v1beta1',
                }),
            },
          ],
        },
      ],
    },

    //SERVICE MANAGEMENT CATEGORY
    {
      category: {
        label: i18next.t('service-management.title'),
        icon: 'add-coursebook',
        collapsible: true,
      },
      pathSegment: '_service_management_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: i18next.t('service-management.title'),
      pathSegment: 'catalog',
      navigationContext: 'catalog',
      label: i18next.t('catalog.menu-title'),
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
      category: i18next.t('service-management.title'),
      pathSegment: 'instances',
      navigationContext: 'instances',
      label: i18next.t('instances.title'),
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
      category: i18next.t('service-management.title'),
      pathSegment: 'brokers',
      navigationContext: 'brokers',
      label: i18next.t('brokers.title'),
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
    {
      category: i18next.t('service-management.title'),
      pathSegment: 'serviceinstances',
      navigationContext: 'serviceinstances',
      label: i18next.t('btp-instances.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/serviceInstances?' +
        toSearchParamsString({
          resourceApiPath: '/apis/services.cloud.sap.com/v1alpha1',
          readOnly: false,
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.BTP_CATALOG],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':instanceName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/serviceInstances/:instanceName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/services.cloud.sap.com/v1alpha1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('service-management.title'),
      pathSegment: 'servicebindings',
      navigationContext: 'servicebindings',
      label: i18next.t('btp-service-bindings.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/serviceBindings?' +
        toSearchParamsString({
          resourceApiPath: '/apis/services.cloud.sap.com/v1alpha1',
          readOnly: false,
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.BTP_CATALOG],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':bindingName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/serviceBindings/:bindingName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/services.cloud.sap.com/v1alpha1',
                }),
            },
          ],
        },
      ],
    },

    //CONFIGURATION CATEGORY (NAMESPACE)
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
      category: i18next.t('configuration.title'),
      pathSegment: 'addons',
      resourceType: 'addonsconfigurations',
      navigationContext: 'addonsconfigurations',
      label: i18next.t('addons.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'configmaps',
      resourceType: 'configmaps',
      navigationContext: 'configmaps',
      label: i18next.t('config-maps.title'),
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
      category: i18next.t('configuration.title'),
      resourceType: 'secrets',
      pathSegment: 'secrets',
      navigationContext: 'secrets',
      label: i18next.t('secrets.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'roles',
      resourceType: 'roles',
      navigationContext: 'roles',
      label: i18next.t('roles.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/Roles?' +
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
              resourceType: 'roles',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/Roles/:roleName?' +
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
      category: i18next.t('configuration.title'),
      pathSegment: 'rolebindings',
      resourceType: 'rolebindings',
      navigationContext: 'rolebindings',
      label: i18next.t('role-bindings.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'oauth2clients',
      resourceType: 'oauth2clients',
      navigationContext: 'oauth2clients',
      label: i18next.t('oauth2-clients.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'gitrepositories',
      resourceType: 'gitRepositories',
      navigationContext: 'gitrepositories',
      label: i18next.t('git-repositories.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/GitRepositories?' +
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
          resourceType: 'gitRepositories',
          children: [
            {
              pathSegment: ':gitreponame',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/gitRepositories/:gitreponame?' +
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
      category: i18next.t('configuration.title'),
      resourceType: 'dnsentries',
      pathSegment: 'dnsentries',
      navigationContext: 'dnsentries',
      label: i18next.t('dnsentries.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/DNSEntries?' +
        toSearchParamsString({
          resourceApiPath: '/apis/dns.gardener.cloud/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredFeatures: [features.CUSTOM_DOMAINS],
      },
      children: [
        {
          pathSegment: 'details',
          resourceType: 'dnsentries',
          children: [
            {
              pathSegment: ':dnsentryName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/DNSEntries/:dnsentryName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/dns.gardener.cloud/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      resourceType: 'dnsproviders',
      pathSegment: 'dnsproviders',
      navigationContext: 'dnsproviders',
      label: i18next.t('dnsproviders.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/DNSProviders?' +
        toSearchParamsString({
          resourceApiPath: '/apis/dns.gardener.cloud/v1alpha1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredFeatures: [features.CUSTOM_DOMAINS],
      },
      children: [
        {
          pathSegment: 'details',
          resourceType: 'dnsproviders',
          children: [
            {
              pathSegment: ':dnsproviderName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/DNSProviders/:dnsproviderName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/dns.gardener.cloud/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      pathSegment: 'customresourcedefinitions',
      resourceType: 'customresourcedefinitions',
      navigationContext: 'customresourcedefinitions',
      label: i18next.t('custom-resource-definitions.title'),
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
    {
      category: i18next.t('configuration.title'),
      resourceType: 'issuers',
      pathSegment: 'issuers',
      label: i18next.t('issuers.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/issuers?' +
        toSearchParamsString({
          resourceApiPath: '/apis/cert.gardener.cloud/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.CUSTOM_DOMAINS],
      },

      navigationContext: 'issuers',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':issuerName',
              resourceType: 'issuers',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/issuers/:issuerName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/cert.gardener.cloud/v1alpha1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      resourceType: 'certificates',
      pathSegment: 'certificates',
      label: i18next.t('certificates.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/certificates?' +
        toSearchParamsString({
          resourceApiPath: '/apis/cert.gardener.cloud/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.CUSTOM_DOMAINS],
      },

      navigationContext: 'certificates',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':certificateName',
              resourceType: 'certificates',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/certificates/:certificateName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/cert.gardener.cloud/v1alpha1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      resourceType: 'serviceaccounts',
      pathSegment: 'serviceaccounts',
      label: 'Service Accounts',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ServiceAccounts?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'serviceaccounts',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':serviceAccountName',
              resourceType: 'serviceaccounts',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/ServiceAccounts/:serviceAccountName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
            },
          ],
        },
      ],
    },
  ];
  filterNodesByAvailablePaths(nodes, groupVersions, permissionSet);
  return nodes;
}

export function getStaticRootNodes(
  namespaceChildrenNodesResolver,
  groupVersions,
  permissionSet,
  features,
) {
  const nodes = [
    {
      pathSegment: 'overview',
      label: i18next.t('clusters.overview.title-current-cluster'),
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
              groupVersions,
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
      label: i18next.t('applications.title'),
      category: i18next.t('integration.title'),
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
              navigationContext: 'application',
              viewUrl:
                config.coreUIModuleUrl +
                '/Applications/:name?' +
                toSearchParamsString({
                  resourceApiPath:
                    '/apis/applicationconnector.kyma-project.io/v1alpha1',
                }),
              viewGroup: coreUIViewGroupName,
              children: [
                {
                  pathSegment: ':serviceName',
                  resourceType: 'applications',
                  viewUrl:
                    config.coreUIModuleUrl +
                    '/Applications/:name/:serviceName?' +
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
      ],
    },
    {
      pathSegment: 'addons-config',
      navigationContext: 'clusteraddonsconfigurations',
      resourceType: 'clusteraddonsconfigurations',
      label: i18next.t('cluster-addons.title'),
      category: {
        label: i18next.t('integration.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'clusterroles',
      navigationContext: 'clusterroles',
      resourceType: 'clusterroles',
      label: i18next.t('cluster-roles.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/ClusterRoles?' +
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
              resourceType: 'clusterroles',
              viewUrl:
                config.coreUIModuleUrl +
                '/ClusterRoles/:roleName?' +
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
      pathSegment: 'clusterrolebindings',
      resourceType: 'clusterrolebindings',
      navigationContext: 'clusterrolebindings',
      label: i18next.t('cluster-role-bindings.title'),
      category: i18next.t('configuration.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'customresourcedefinitions',
      resourceType: 'customresourcedefinitions',
      navigationContext: 'customresourcedefinitions',
      label: i18next.t('custom-resource-definitions.title'),
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
  filterNodesByAvailablePaths(nodes, groupVersions, permissionSet);
  return nodes;
}

function extractApiGroup(apiPath) {
  if (apiPath === '/api/v1') {
    return ''; // core api group
  }
  return apiPath.split('/')[2];
}

function filterNodesByAvailablePaths(nodes, groupVersions, permissionSet) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (typeof node.children === 'object') {
      filterNodesByAvailablePaths(node.children, groupVersions, permissionSet);
    }

    const removeNode = () => nodes.splice(i, 1);
    checkSingleNode(node, groupVersions, permissionSet, removeNode);
  }
}

function checkSingleNode(node, groupVersions, permissionSet, removeNode) {
  if (!node.viewUrl || !node.resourceType) return;
  const apiPath = new URL(node.viewUrl).searchParams.get('resourceApiPath');
  if (!apiPath) return;

  if (hasWildcardPermission(permissionSet)) {
    // we have '*' in permissions, just check if this resource exists
    const groupVersion = apiPath
      .replace(/^\/apis\//, '')
      .replace(/^\/api\//, '');

    if (!groupVersions.find(g => g.includes(groupVersion))) {
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
