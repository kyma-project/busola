import { saveAs } from 'file-saver';
import i18next from 'i18next';
import { config } from '../config';
import { showAlert } from '../utils/showAlert';
import {
  getActiveClusterName,
  getClusters,
} from './../cluster-management/cluster-management';
import { doesUserHavePermission } from './permissions';
import { getCustomPaths } from './customPaths';
import { mergeInExtensibilityNav } from './mergeInExtensibilityNav';

import { excludeNavigationNode } from './excludeNavigationNode';

export const coreUIViewGroupName = '_core_ui_';

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
  permissionSet,
  features,
  customResources,
) {
  const customPaths = getCustomPaths(customResources, 'namespace');

  const encodedClusterName = encodeURIComponent(getActiveClusterName());
  const nodes = [
    {
      link: `/cluster/${encodedClusterName}/overview`,
      label: i18next.t('clusters.overview.back'),
      icon: 'nav-back',
      hideFromNav: !doesUserHavePermission(
        ['get', 'list'],
        { resourceGroupAndVersion: 'v1', resourceKind: 'namespace' },
        permissionSet,
      ),
    },
    {
      pathSegment: 'details',
      label: i18next.t('namespaces.overview.title'),
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
      pathSegment: 'events',
      resourceType: 'events',
      label: i18next.t('events.title'),
      icon: 'message-warning',
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/events?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      navigationContext: 'events',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':eventName',
              resourceType: 'events',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/events/:eventName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
      defaultChildNode: 'details',
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
        '/namespaces/:namespaceId/functions?' +
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
      category: i18next.t('workloads.title'),
      pathSegment: 'deployments',
      resourceType: 'deployments',

      label: i18next.t('deployments.title'),
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
              resourceType: 'deployments',
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
        '/namespaces/:namespaceId/daemonsets?' +
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
                '/namespaces/:namespaceId/daemonsets/:daemonSetName?' +
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
          resourceApiPath: '/apis/batch/v1',
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
                  resourceApiPath: '/apis/batch/v1',
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
      navigationContext: 'replicasets',
      label: i18next.t('replica-sets.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/replicasets?' +
        toSearchParamsString({
          resourceApiPath: '/apis/apps/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          resourceType: 'replicasets',
          children: [
            {
              pathSegment: ':replicaSetName',
              resourceType: 'replicasets',
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
      category: i18next.t('workloads.title'),
      pathSegment: 'pods',
      resourceType: 'pods',
      label: i18next.t('pods.title'),
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
              resourceType: 'pods',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/pods/:podName?' +
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
                        '/namespaces/:namespaceId/pods/:podName/containers/:containerName',
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
                        '/namespaces/:namespaceId/pods/:podName/initcontainers/:containerName',
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
        '/namespaces/:namespaceId/apirules?' +
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
                '/namespaces/:namespaceId/apirules/:apiName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/gateway.kyma-project.io/v1alpha1',
                }),
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('discovery-and-network.title'),
      pathSegment: 'ingresses',
      resourceType: 'ingresses',
      navigationContext: 'ingresses',
      label: i18next.t('ingresses.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/ingresses?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':ingressName',
              resourceType: 'ingresses',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/ingresses/:ingressName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/networking.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
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
        '/namespaces/:namespaceId/services?' +
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
      category: i18next.t('discovery-and-network.title'),
      pathSegment: 'horizontalpodautoscalers',
      resourceType: 'horizontalpodautoscalers',
      navigationContext: 'horizontalpodautoscalers',
      label: i18next.t('hpas.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/horizontalpodautoscalers?' +
        toSearchParamsString({
          resourceApiPath: '/apis/autoscaling/v2beta2',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':horizontalPodAutoscalersName',
              resourceType: 'horizontalpodautoscalers',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/horizontalpodautoscalers/:horizontalPodAutoscalersName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/autoscaling/v2beta2',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('discovery-and-network.title'),
      pathSegment: 'networkpolicies',
      resourceType: 'networkpolicies',
      navigationContext: 'networkpolicies',
      label: i18next.t('network-policies.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/networkpolicies?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.k8s.io/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':networkPolicyName',
              resourceType: 'networkpolicies',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/networkpolicies/:networkPolicyName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/networking.k8s.io/v1',
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
      resourceType: 'destinationrules',
      pathSegment: 'destinationrules',
      label: i18next.t('destination-rules.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/destinationrules?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.istio.io/v1beta1',
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
                '/namespaces/:namespaceId/destinationrules/:destinationRuleName?' +
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
      resourceType: 'virtualservices',
      pathSegment: 'virtualservices',
      label: i18next.t('virtualservices.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/virtualservices?' +
        toSearchParamsString({
          resourceApiPath: '/apis/networking.istio.io/v1beta1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.ISTIO],
      },

      navigationContext: 'virtualservices',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':virtualserviceName',
              resourceType: 'virtualservices',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/virtualservices/:virtualserviceName?' +
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
      resourceType: 'authorizationpolicies',
      pathSegment: 'authorizationpolicies',
      label: i18next.t('authorization-policies.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/authorizationpolicies?' +
        toSearchParamsString({
          resourceApiPath: '/apis/security.istio.io/v1beta1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      context: {
        requiredFeatures: [features.ISTIO],
      },

      navigationContext: 'authorizationpolicies',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':authorizationpolicyName',
              resourceType: 'authorizationpolicies',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/authorizationpolicies/:authorizationpolicyName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/security.istio.io/v1beta1',
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
      pathSegment: 'serviceinstances',
      navigationContext: 'serviceinstances',
      resourceType: 'serviceinstances',
      label: i18next.t('btp-instances.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/serviceinstances?' +
        toSearchParamsString({
          resourceApiPath: '/apis/services.cloud.sap.com/v1',
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
                '/namespaces/:namespaceId/serviceinstances/:instanceName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/services.cloud.sap.com/v1',
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
      resourceType: 'servicebindings',
      label: i18next.t('btp-service-bindings.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/servicebindings?' +
        toSearchParamsString({
          resourceApiPath: '/apis/services.cloud.sap.com/v1',
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
                '/namespaces/:namespaceId/servicebindings/:bindingName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/services.cloud.sap.com/v1',
                }),
            },
          ],
        },
      ],
    },

    //STORAGE CATEGORY
    {
      category: {
        label: i18next.t('storage.title'),
        icon: 'sap-box',
        collapsible: true,
      },
      pathSegment: '_storage_category_placeholder_',
      hideFromNav: true,
    },
    {
      category: i18next.t('storage.title'),
      resourceType: 'persistentvolumeclaims',
      pathSegment: 'persistentvolumeclaims',
      label: i18next.t('persistent-volume-claims.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/persistentvolumeclaims?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,

      navigationContext: 'persistentvolumeclaims',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':persistentVolumeClaimName',
              resourceType: 'persistentvolumeclaims',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/persistentvolumeclaims/:persistentVolumeClaimName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
            },
          ],
        },
      ],
    },

    //APPS CATEGORY
    {
      category: {
        label: i18next.t('apps.title'),
        icon: 'example', //grid
        collapsible: true,
      },
    },
    {
      category: i18next.t('apps.title'),
      pathSegment: 'helm-releases',
      label: i18next.t('helm-releases.title'),
      keepSelectedForChildren: true,
      viewUrl:
        config.coreUIModuleUrl + '/namespaces/:namespaceId/helm-releases?',
      viewGroup: coreUIViewGroupName,
      navigationContext: 'helm-releases',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':releaseName',
              resourceType: 'helm-releases',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/helm-releases/:releaseName',
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
      pathSegment: 'configmaps',
      resourceType: 'configmaps',
      navigationContext: 'configmaps',
      label: i18next.t('config-maps.title'),
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
              resourceType: 'configmaps',
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
      category: i18next.t('configuration.title'),
      resourceType: 'secrets',
      pathSegment: 'secrets',
      navigationContext: 'secrets',
      label: i18next.t('secrets.title'),
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
              resourceType: 'secrets',
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
      category: i18next.t('configuration.title'),
      pathSegment: 'subscriptions',
      resourceType: 'subscriptions',
      navigationContext: 'subscriptions',
      label: i18next.t('subscriptions.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/subscriptions?' +
        toSearchParamsString({
          resourceApiPath: '/apis/eventing.kyma-project.io/v1alpha1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':subscriptionName',
              resourceType: 'subscriptions',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/subscriptions/:subscriptionName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/eventing.kyma-project.io/v1alpha1',
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
              resourceType: 'roles',
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
      category: i18next.t('configuration.title'),
      pathSegment: 'rolebindings',
      resourceType: 'rolebindings',
      navigationContext: 'rolebindings',
      label: i18next.t('role-bindings.title'),
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
              resourceType: 'rolebindings',
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
      category: i18next.t('configuration.title'),
      pathSegment: 'oauth2clients',
      resourceType: 'oauth2clients',
      navigationContext: 'oauth2clients',
      label: i18next.t('oauth2-clients.title'),
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
      category: i18next.t('configuration.title'),
      pathSegment: 'gitrepositories',
      resourceType: 'gitRepositories',
      navigationContext: 'gitrepositories',
      label: i18next.t('git-repositories.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/gitrepositories?' +
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
                '/namespaces/:namespaceId/gitrepositories/:gitreponame?' +
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
        '/namespaces/:namespaceId/dnsentries?' +
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
                '/namespaces/:namespaceId/dnsentries/:dnsentryName?' +
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
        '/namespaces/:namespaceId/dnsproviders?' +
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
                '/namespaces/:namespaceId/dnsproviders/:dnsproviderName?' +
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
      label: i18next.t('service-accounts.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/namespaces/:namespaceId/serviceaccounts?' +
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
                '/namespaces/:namespaceId/serviceaccounts/:serviceAccountName?' +
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
      pathSegment: 'customresources',
      navigationContext: 'customresources',
      label: i18next.t('custom-resources.title'),
      viewUrl:
        config.coreUIModuleUrl + '/namespaces/:namespaceId/customresources',
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredGroupResource: {
          group: 'apiextensions.k8s.io/v1',
          resource: 'customresourcedefinitions',
        },
      },
      children: [
        {
          pathSegment: ':crdName',
          viewUrl:
            config.coreUIModuleUrl +
            '/namespaces/:namespaceId/customresources/:crdName',
          navigationContext: 'customresourcedefinition',
          viewGroup: coreUIViewGroupName,
          children: [
            {
              pathSegment: ':crName',
              viewUrl:
                config.coreUIModuleUrl +
                '/namespaces/:namespaceId/customresources/:crdName/:crName',
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
  ];

  const allNodes = mergeInExtensibilityNav(nodes, customPaths);

  return filterNodesByAvailablePaths(allNodes, permissionSet);
}

export function getStaticRootNodes(
  namespaceChildrenNodesResolver,
  permissionSet,
  features,
  customResources,
) {
  const customPaths = getCustomPaths(customResources, 'cluster');

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
        '/namespaces?' +
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
              permissionSet,
              features,
              customResources,
            ),
          defaultChildNode: 'details',
        },
      ],
    },

    {
      pathSegment: 'events',
      resourceType: 'events',
      label: i18next.t('events.title'),
      icon: 'message-warning',
      viewUrl:
        config.coreUIModuleUrl +
        '/events?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      navigationContext: 'events',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':eventName',
              resourceType: 'events',
              viewUrl:
                config.coreUIModuleUrl +
                '/events/:eventName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
      defaultChildNode: 'details',
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
        '/applications?' +
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
                '/applications/:name?' +
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
                    '/applications/:name/:serviceName?' +
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

    //STORAGE CATEGORY
    {
      category: {
        label: i18next.t('storage.title'),
        icon: 'sap-box',
        collapsible: true,
      },
      pathSegment: '_storage_category_placeholder_',
      hideFromNav: true,
    },
    {
      pathSegment: 'storageclasses',
      resourceType: 'storageclasses',
      navigationContext: 'storageclasses',
      label: i18next.t('storage-classes.title'),
      category: i18next.t('storage.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/storageclasses?' +
        toSearchParamsString({
          resourceApiPath: '/apis/storage.k8s.io/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':storageClassName',
              resourceType: 'storageclasses',
              viewUrl:
                config.coreUIModuleUrl +
                '/storageclasses/:storageClassName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/storage.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('storage.title'),
      resourceType: 'persistentvolumes',
      pathSegment: 'persistentvolumes',
      label: i18next.t('pv.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/persistentvolumes?' +
        toSearchParamsString({
          resourceApiPath: '/api/v1',
          hasDetailsView: true,
        }),
      viewGroup: coreUIViewGroupName,
      keepSelectedForChildren: true,
      navigationContext: 'persistentvolumes',
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':persistentVolumesName',
              resourceType: 'persistentvolumes',
              viewUrl:
                config.coreUIModuleUrl +
                '/persistentvolumes/:persistentVolumesName?' +
                toSearchParamsString({
                  resourceApiPath: '/api/v1',
                }),
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
        '/clusterroles?' +
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
                '/clusterroles/:roleName?' +
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
              resourceType: 'clusterrolebindings',
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
      category: i18next.t('configuration.title'),
      pathSegment: 'customresourcedefinitions',
      resourceType: 'customresourcedefinitions',
      navigationContext: 'customresourcedefinitions',
      label: i18next.t('custom-resource-definitions.title'),
      viewUrl:
        config.coreUIModuleUrl +
        '/customresourcedefinitions?' +
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
                '/customresourcedefinitions/:CustomResourceDefinitionName?' +
                toSearchParamsString({
                  resourceApiPath: '/apis/apiextensions.k8s.io/v1',
                }),
              viewGroup: coreUIViewGroupName,
              // children: [
              //   {
              //     pathSegment: ':resourceVersion',
              //     children: [
              //       {
              //         pathSegment: ':resourceName',
              //         resourceType: 'customresource',
              //         viewUrl:
              //           config.coreUIModuleUrl +
              //           '/customresourcedefinitions/:CustomResourceDefinitionName/:resourceVersion/:resourceName',
              //         viewGroup: coreUIViewGroupName,
              //       },
              //     ],
              //   },
              // ],
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      pathSegment: 'customresources',
      navigationContext: 'customresources',
      label: i18next.t('custom-resources.title'),
      viewUrl: config.coreUIModuleUrl + '/customresources',
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredGroupResource: {
          group: 'apiextensions.k8s.io/v1',
          resource: 'customresourcedefinitions',
        },
      },
      children: [
        {
          pathSegment: ':crdName',
          viewUrl: config.coreUIModuleUrl + '/customresources/:crdName',
          navigationContext: 'customresourcedefinition',
          viewGroup: coreUIViewGroupName,
          children: [
            {
              pathSegment: ':crName',
              viewUrl:
                config.coreUIModuleUrl + '/customresources/:crdName/:crName',
              viewGroup: coreUIViewGroupName,
            },
          ],
        },
      ],
    },
    {
      category: i18next.t('configuration.title'),
      pathSegment: 'busolaextensions',
      navigationContext: 'busolaextensions',
      label: i18next.t('extensibility.title'),
      viewUrl: config.coreUIModuleUrl + '/busolaextensions',
      keepSelectedForChildren: true,
      viewGroup: coreUIViewGroupName,
      context: {
        requiredFeatures: [features.EXTENSIBILITY],
      },
      children: [
        {
          pathSegment: 'details',
          children: [
            {
              pathSegment: ':namespace',
              children: [
                {
                  pathSegment: ':name',
                  resourceType: 'configmaps',
                  viewUrl:
                    config.coreUIModuleUrl +
                    '/busolaextensions/details/:namespace/:name',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      pathSegment: 'download-kubeconfig',
      navigationContext: 'kubeconfig',
      hideFromNav: true,
      onNodeActivation: downloadKubeconfig,
    },
  ];

  const allNodes = mergeInExtensibilityNav(nodes, customPaths);

  return filterNodesByAvailablePaths(allNodes, permissionSet);
}

function filterNodesByAvailablePaths(nodes, permissionSet) {
  for (const node of nodes) {
    if (typeof node.children === 'object') {
      node.children = filterNodesByAvailablePaths(node.children, permissionSet);
    }
    excludeNavigationNode(node, permissionSet);
  }

  return nodes.filter(n => !n.toDelete);
}
