export function createShootTemplate(namespace) {
  return {
    metadata: {
      name: '',
      namespace,
      labels: {},
      annotations: {},
    },
    spec: {
      //   addons: {
      //     kubernetesDashboard: {
      //       enabled: false,
      //       authenticationMode: 'token',
      //     },
      //     nginxIngress: {
      //       enabled: false,
      //       externalTrafficPolicy: 'Cluster',
      //     },
      //   },
      cloudProfileName: 'gcp',
      //   dns: {
      //     domain: 'fantastic.hasselhoff.shoot.canary.k8s-hana.ondemand.com',
      //   },
      //   hibernation: {
      //     enabled: false,
      //     schedules: [
      //       {
      //         start: '00 19 * * 1,2,3,4,5',
      //         end: '00 06 * * 1,2,3,4,5',
      //         location: 'Europe/Berlin',
      //       },
      //     ],
      //   },
      kubernetes: {
        // allowPrivilegedContainers: true,
        // kubeAPIServer: {
        //   enableBasicAuthentication: false,
        //   requests: {
        //     maxNonMutatingInflight: 400,
        //     maxMutatingInflight: 200,
        //   },
        //   enableAnonymousAuthentication: false,
        // },
        // kubeControllerManager: {
        //   nodeCIDRMaskSize: 24,
        //   podEvictionTimeout: '2m0s',
        //   nodeMonitorGracePeriod: '2m0s',
        // },
        // kubeProxy: {
        //   mode: 'IPTables',
        //   enabled: true,
        // },
        // kubelet: {
        //   failSwapOn: true,
        //   kubeReserved: {
        //     cpu: '80m',
        //     memory: '1Gi',
        //     pid: '20k',
        //   },
        //   imageGCHighThresholdPercent: 50,
        //   imageGCLowThresholdPercent: 40,
        // },
        version: '1.20.9',
        // verticalPodAutoscaler: {
        //   enabled: true,
        //   evictAfterOOMThreshold: '10m0s',
        //   evictionRateBurst: 1,
        //   evictionRateLimit: -1,
        //   evictionTolerance: 0.5,
        //   recommendationMarginFraction: 0.15,
        //   updaterInterval: '1m0s',
        //   recommenderInterval: '1m0s',
        // },
      },
      networking: {
        type: 'calico',
        pods: '100.96.0.0/11',
        nodes: '10.250.0.0/16',
        services: '100.64.0.0/13',
      },
      //   maintenance: {
      //     autoUpdate: {
      //       kubernetesVersion: true,
      //       machineImageVersion: true,
      //     },
      //     timeWindow: {
      //       begin: '010000+0000',
      //       end: '020000+0000',
      //     },
      //   },
      provider: {
        type: 'gcp',
        controlPlaneConfig: {
          apiVersion: 'gcp.provider.extensions.gardener.cloud/v1alpha1',
          kind: 'ControlPlaneConfig',
          zone: 'europe-west1-d',
        },
        infrastructureConfig: {
          apiVersion: 'gcp.provider.extensions.gardener.cloud/v1alpha1',
          kind: 'InfrastructureConfig',
          networks: {
            workers: '10.250.0.0/16',
          },
        },
        workers: [
          {
            name: 'worker-dev',
            machine: {
              type: 'n1-standard-2',
              image: {
                name: 'gardenlinux',
                version: '318.8.0',
              },
            },
            maximum: 3,
            minimum: 1,
            maxSurge: 1,
            maxUnavailable: 0,
            volume: {
              type: 'pd-ssd',
              size: '20Gi',
            },
            zones: ['europe-west1-d'],
            systemComponents: {
              allow: true,
            },
          },
        ],
      },
      purpose: 'evaluation',
      region: 'europe-west1',
      secretBindingName: 'gardener',
    },
  };
}
