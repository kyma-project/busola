import { mockGetRequest } from '../createMock';

export const clusterDetailsApis = mockGetRequest('/backend/apis', {
  kind: 'APIGroupList',
  apiVersion: 'v1',
  groups: [
    {
      name: 'apiregistration.k8s.io',
      versions: [
        {
          groupVersion: 'apiregistration.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'apiregistration.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'apiregistration.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'apps',
      versions: [
        {
          groupVersion: 'apps/v1',
          version: 'v1',
        },
      ],
      preferredVersion: {
        groupVersion: 'apps/v1',
        version: 'v1',
      },
    },
    {
      name: 'events.k8s.io',
      versions: [
        {
          groupVersion: 'events.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'events.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'events.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'authentication.k8s.io',
      versions: [
        {
          groupVersion: 'authentication.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'authentication.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'authentication.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'authorization.k8s.io',
      versions: [
        {
          groupVersion: 'authorization.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'authorization.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'authorization.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'autoscaling',
      versions: [
        {
          groupVersion: 'autoscaling/v1',
          version: 'v1',
        },
        {
          groupVersion: 'autoscaling/v2beta1',
          version: 'v2beta1',
        },
        {
          groupVersion: 'autoscaling/v2beta2',
          version: 'v2beta2',
        },
      ],
      preferredVersion: {
        groupVersion: 'autoscaling/v1',
        version: 'v1',
      },
    },
    {
      name: 'batch',
      versions: [
        {
          groupVersion: 'batch/v1',
          version: 'v1',
        },
        {
          groupVersion: 'batch/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'batch/v1',
        version: 'v1',
      },
    },
    {
      name: 'certificates.k8s.io',
      versions: [
        {
          groupVersion: 'certificates.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'certificates.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'certificates.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'networking.k8s.io',
      versions: [
        {
          groupVersion: 'networking.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'networking.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'networking.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'extensions',
      versions: [
        {
          groupVersion: 'extensions/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'extensions/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'policy',
      versions: [
        {
          groupVersion: 'policy/v1',
          version: 'v1',
        },
        {
          groupVersion: 'policy/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'policy/v1',
        version: 'v1',
      },
    },
    {
      name: 'rbac.authorization.k8s.io',
      versions: [
        {
          groupVersion: 'rbac.authorization.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'rbac.authorization.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'rbac.authorization.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'storage.k8s.io',
      versions: [
        {
          groupVersion: 'storage.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'storage.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'storage.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'admissionregistration.k8s.io',
      versions: [
        {
          groupVersion: 'admissionregistration.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'admissionregistration.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'admissionregistration.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'apiextensions.k8s.io',
      versions: [
        {
          groupVersion: 'apiextensions.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'apiextensions.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'apiextensions.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'scheduling.k8s.io',
      versions: [
        {
          groupVersion: 'scheduling.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'scheduling.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'scheduling.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'coordination.k8s.io',
      versions: [
        {
          groupVersion: 'coordination.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'coordination.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'coordination.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'node.k8s.io',
      versions: [
        {
          groupVersion: 'node.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'node.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'node.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'discovery.k8s.io',
      versions: [
        {
          groupVersion: 'discovery.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'discovery.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'discovery.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'flowcontrol.apiserver.k8s.io',
      versions: [
        {
          groupVersion: 'flowcontrol.apiserver.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'flowcontrol.apiserver.k8s.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'autoscaling.k8s.io',
      versions: [
        {
          groupVersion: 'autoscaling.k8s.io/v1',
          version: 'v1',
        },
        {
          groupVersion: 'autoscaling.k8s.io/v1beta2',
          version: 'v1beta2',
        },
      ],
      preferredVersion: {
        groupVersion: 'autoscaling.k8s.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'crd.projectcalico.org',
      versions: [
        {
          groupVersion: 'crd.projectcalico.org/v1',
          version: 'v1',
        },
      ],
      preferredVersion: {
        groupVersion: 'crd.projectcalico.org/v1',
        version: 'v1',
      },
    },
    {
      name: 'jaegertracing.io',
      versions: [
        {
          groupVersion: 'jaegertracing.io/v1',
          version: 'v1',
        },
      ],
      preferredVersion: {
        groupVersion: 'jaegertracing.io/v1',
        version: 'v1',
      },
    },
    {
      name: 'monitoring.coreos.com',
      versions: [
        {
          groupVersion: 'monitoring.coreos.com/v1',
          version: 'v1',
        },
        {
          groupVersion: 'monitoring.coreos.com/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'monitoring.coreos.com/v1',
        version: 'v1',
      },
    },
    {
      name: 'services.cloud.sap.com',
      versions: [
        {
          groupVersion: 'services.cloud.sap.com/v1',
          version: 'v1',
        },
        {
          groupVersion: 'services.cloud.sap.com/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'services.cloud.sap.com/v1',
        version: 'v1',
      },
    },
    {
      name: 'addons.kyma-project.io',
      versions: [
        {
          groupVersion: 'addons.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'addons.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'applicationconnector.kyma-project.io',
      versions: [
        {
          groupVersion: 'applicationconnector.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'applicationconnector.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'cert.gardener.cloud',
      versions: [
        {
          groupVersion: 'cert.gardener.cloud/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'cert.gardener.cloud/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'compass.kyma-project.io',
      versions: [
        {
          groupVersion: 'compass.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'compass.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'dns.gardener.cloud',
      versions: [
        {
          groupVersion: 'dns.gardener.cloud/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'dns.gardener.cloud/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'eventing.kyma-project.io',
      versions: [
        {
          groupVersion: 'eventing.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'eventing.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'extensions.istio.io',
      versions: [
        {
          groupVersion: 'extensions.istio.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'extensions.istio.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'gateway.kyma-project.io',
      versions: [
        {
          groupVersion: 'gateway.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'gateway.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'hydra.ory.sh',
      versions: [
        {
          groupVersion: 'hydra.ory.sh/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'hydra.ory.sh/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'install.istio.io',
      versions: [
        {
          groupVersion: 'install.istio.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'install.istio.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'oathkeeper.ory.sh',
      versions: [
        {
          groupVersion: 'oathkeeper.ory.sh/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'oathkeeper.ory.sh/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'serverless.kyma-project.io',
      versions: [
        {
          groupVersion: 'serverless.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'serverless.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'servicecatalog.kyma-project.io',
      versions: [
        {
          groupVersion: 'servicecatalog.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'servicecatalog.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'settings.svcat.k8s.io',
      versions: [
        {
          groupVersion: 'settings.svcat.k8s.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'settings.svcat.k8s.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'telemetry.istio.io',
      versions: [
        {
          groupVersion: 'telemetry.istio.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'telemetry.istio.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'telemetry.kyma-project.io',
      versions: [
        {
          groupVersion: 'telemetry.kyma-project.io/v1alpha1',
          version: 'v1alpha1',
        },
      ],
      preferredVersion: {
        groupVersion: 'telemetry.kyma-project.io/v1alpha1',
        version: 'v1alpha1',
      },
    },
    {
      name: 'networking.istio.io',
      versions: [
        {
          groupVersion: 'networking.istio.io/v1beta1',
          version: 'v1beta1',
        },
        {
          groupVersion: 'networking.istio.io/v1alpha3',
          version: 'v1alpha3',
        },
      ],
      preferredVersion: {
        groupVersion: 'networking.istio.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'rafter.kyma-project.io',
      versions: [
        {
          groupVersion: 'rafter.kyma-project.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'rafter.kyma-project.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'security.istio.io',
      versions: [
        {
          groupVersion: 'security.istio.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'security.istio.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'servicecatalog.k8s.io',
      versions: [
        {
          groupVersion: 'servicecatalog.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'servicecatalog.k8s.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'snapshot.storage.k8s.io',
      versions: [
        {
          groupVersion: 'snapshot.storage.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'snapshot.storage.k8s.io/v1beta1',
        version: 'v1beta1',
      },
    },
    {
      name: 'metrics.k8s.io',
      versions: [
        {
          groupVersion: 'metrics.k8s.io/v1beta1',
          version: 'v1beta1',
        },
      ],
      preferredVersion: {
        groupVersion: 'metrics.k8s.io/v1beta1',
        version: 'v1beta1',
      },
    },
  ],
});
