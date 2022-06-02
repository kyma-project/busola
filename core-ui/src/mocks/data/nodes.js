import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsNodes = mockGetRequest('/backend/api/v1/nodes', {
  kind: 'NodeList',
  apiVersion: 'v1',
  metadata: {
    resourceVersion: '13778410',
  },
  items: [
    {
      metadata: {
        name: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk',
        uid: 'c49dbcd4-104a-4026-bc25-1e9df1feee3a',
        resourceVersion: '13778349',
        creationTimestamp: '2022-06-02T03:03:35Z',
        labels: {
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'n2-standard-8',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'europe-west4',
          'failure-domain.beta.kubernetes.io/zone': 'europe-west4-b',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk',
          'kubernetes.io/os': 'linux',
          'node.kubernetes.io/instance-type': 'n2-standard-8',
          'node.kubernetes.io/role': 'node',
          'topology.gke.io/zone': 'europe-west4-b',
          'topology.kubernetes.io/region': 'europe-west4',
          'topology.kubernetes.io/zone': 'europe-west4-b',
          'worker.garden.sapcloud.io/group': 'worker-dev',
          'worker.gardener.cloud/kubernetes-version': '1.21.10',
          'worker.gardener.cloud/pool': 'worker-dev',
          'worker.gardener.cloud/system-components': 'true',
        },
        annotations: {
          'checksum/cloud-config-data':
            '433e02dd607b177c1b45b9fcfe120c07a11933dff29eb05c327683b7562bc01e',
          'csi.volume.kubernetes.io/nodeid':
            '{"pd.csi.storage.gke.io":"projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/instances/shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk"}',
          'node.alpha.kubernetes.io/ttl': '0',
          'node.machine.sapcloud.io/last-applied-anno-labels-taints':
            '{"metadata":{"creationTimestamp":null,"labels":{"node.kubernetes.io/role":"node","worker.garden.sapcloud.io/group":"worker-dev","worker.gardener.cloud/pool":"worker-dev","worker.gardener.cloud/system-components":"true"}},"spec":{}}',
          'projectcalico.org/IPv4Address': '10.250.0.92/32',
          'projectcalico.org/IPv4IPIPTunnelAddr': '100.96.0.1',
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true',
        },
        managedFields: [
          {
            manager: 'gcp-cloud-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:38Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:labels': {
                  'f:beta.kubernetes.io/instance-type': {},
                  'f:failure-domain.beta.kubernetes.io/region': {},
                  'f:failure-domain.beta.kubernetes.io/zone': {},
                  'f:node.kubernetes.io/instance-type': {},
                  'f:topology.kubernetes.io/region': {},
                  'f:topology.kubernetes.io/zone': {},
                },
              },
              'f:spec': { 'f:providerID': {} },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    '.': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'machine-controller',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:50Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:node.machine.sapcloud.io/last-applied-anno-labels-taints': {},
                },
                'f:labels': {
                  'f:node.kubernetes.io/role': {},
                  'f:worker.garden.sapcloud.io/group': {},
                  'f:worker.gardener.cloud/pool': {},
                  'f:worker.gardener.cloud/system-components': {},
                },
              },
            },
          },
          {
            manager: 'calico-node',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:39Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:projectcalico.org/IPv4Address': {},
                  'f:projectcalico.org/IPv4IPIPTunnelAddr': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kube-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:49Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:node.alpha.kubernetes.io/ttl': {} },
              },
              'f:spec': {
                'f:podCIDR': {},
                'f:podCIDRs': { '.': {}, 'v:"100.96.0.0/24"': {} },
              },
              'f:status': { 'f:volumesAttached': {} },
            },
          },
          {
            manager: 'node-problem-detector',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:50Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:status': {
                'f:conditions': {
                  'k:{"type":"CorruptDockerOverlay2"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentContainerdRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentDockerRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentKubeletRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentUnregisterNetDevice"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"KernelDeadlock"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"ReadonlyFilesystem"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kubelet',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:05:54Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:csi.volume.kubernetes.io/nodeid': {},
                  'f:volumes.kubernetes.io/controller-managed-attach-detach': {},
                },
                'f:labels': {
                  '.': {},
                  'f:beta.kubernetes.io/arch': {},
                  'f:beta.kubernetes.io/os': {},
                  'f:kubernetes.io/arch': {},
                  'f:kubernetes.io/hostname': {},
                  'f:kubernetes.io/os': {},
                  'f:topology.gke.io/zone': {},
                  'f:worker.gardener.cloud/kubernetes-version': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"DiskPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"MemoryPressure"}': {
                    'f:lastHeartbeatTime': {},
                  },
                  'k:{"type":"PIDPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"Ready"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                  },
                },
                'f:images': {},
                'f:volumesInUse': {},
              },
            },
          },
          {
            manager: 'kubectl-annotate',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:06:37Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:checksum/cloud-config-data': {} },
              },
            },
          },
        ],
      },
      spec: {
        podCIDR: '100.96.0.0/24',
        podCIDRs: ['100.96.0.0/24'],
        providerID:
          'gce://sap-se-cx-kyma-swinka/europe-west4-b/shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk',
      },
      status: {
        capacity: {
          cpu: '8',
          'ephemeral-storage': '60748640Ki',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '32884952Ki',
          pods: '110',
        },
        allocatable: {
          cpu: '7920m',
          'ephemeral-storage': '59096276946',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '31733976Ki',
          pods: '110',
        },
        conditions: [
          {
            type: 'ReadonlyFilesystem',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'FilesystemIsNotReadOnly',
            message: 'Filesystem is not read-only',
          },
          {
            type: 'FrequentKubeletRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'NoFrequentKubeletRestart',
            message: 'kubelet is functioning properly',
          },
          {
            type: 'FrequentDockerRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'NoFrequentDockerRestart',
            message: 'docker is functioning properly',
          },
          {
            type: 'FrequentContainerdRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'NoFrequentContainerdRestart',
            message: 'containerd is functioning properly',
          },
          {
            type: 'FrequentUnregisterNetDevice',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'NoFrequentUnregisterNetDevice',
            message: 'node is functioning properly',
          },
          {
            type: 'CorruptDockerOverlay2',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'NoCorruptDockerOverlay2',
            message: 'docker overlay2 is functioning properly',
          },
          {
            type: 'KernelDeadlock',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:30Z',
            lastTransitionTime: '2022-06-02T03:05:56Z',
            reason: 'KernelHasNoDeadlock',
            message: 'kernel has no deadlock',
          },
          {
            type: 'NetworkUnavailable',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T03:04:39Z',
            lastTransitionTime: '2022-06-02T03:04:39Z',
            reason: 'CalicoIsUp',
            message: 'Calico is running on this node',
          },
          {
            type: 'MemoryPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:35Z',
            reason: 'KubeletHasSufficientMemory',
            message: 'kubelet has sufficient memory available',
          },
          {
            type: 'DiskPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:35Z',
            reason: 'KubeletHasNoDiskPressure',
            message: 'kubelet has no disk pressure',
          },
          {
            type: 'PIDPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:35Z',
            reason: 'KubeletHasSufficientPID',
            message: 'kubelet has sufficient PID available',
          },
          {
            type: 'Ready',
            status: 'True',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:04:36Z',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status. AppArmor enabled',
          },
        ],
        addresses: [
          {
            type: 'InternalIP',
            address: '10.250.0.92',
          },
          {
            type: 'Hostname',
            address: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk',
          },
        ],
        daemonEndpoints: {
          kubeletEndpoint: {
            Port: 10250,
          },
        },
        nodeInfo: {
          machineID: '8c9186db311f8edcaeb4eb2d67894b28',
          systemUUID: '8c9186db-311f-8edc-aeb4-eb2d67894b28',
          bootID: 'b421cf60-439b-42f8-9b74-3202c2918719',
          kernelVersion: '5.10.109-garden-cloud-amd64',
          osImage: 'Garden Linux 576.8',
          containerRuntimeVersion: 'docker://20.10.11+dfsg1',
          kubeletVersion: 'v1.21.10',
          kubeProxyVersion: 'v1.21.10',
          operatingSystem: 'linux',
          architecture: 'amd64',
        },
        images: [
          {
            names: [
              'eu.gcr.io/kyma-project/xf-application-mocks/commerce-mock@sha256:2a3b8f0fb5dab02ed02ee840929b22b979df523e4fcbdbb59b7c441561951fc2',
              'eu.gcr.io/kyma-project/xf-application-mocks/commerce-mock:0.4.5',
            ],
            sizeBytes: 574840223,
          },
          {
            names: [
              'kubevious/collector@sha256:10740e38c099effe03d5236113d2961ef0211fffe832c3f5ab3b82a39380a180',
              'kubevious/collector:1.0.7',
            ],
            sizeBytes: 254477576,
          },
          {
            names: [
              'kubevious/parser@sha256:b85c7eaf597834d5124103da628e817d2fbed457da3e40e1302e9b4f2d5d0f70',
              'kubevious/parser:1.0.5',
            ],
            sizeBytes: 245284915,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/cni@sha256:39472ef8a62f22e9651c9c639551c4a882e34922629f8fadd12c6154fc5a1b10',
            ],
            sizeBytes: 233749645,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/postgres@sha256:752a7fc46308a48ac55d4c20c640c1a5fc5761839f40d3c3e8ffb34492eb0ac4',
              'eu.gcr.io/kyma-project/external/postgres:11.14-alpine3.15',
            ],
            sizeBytes: 201941480,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/node@sha256:9bf69736030adcfe20c6a27dbef4e474113591bdf8195b598f287245166df8f6',
            ],
            sizeBytes: 197928711,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/gcr_io/gke-release/gcp-compute-persistent-disk-csi-driver@sha256:c19a975323321d1f674baf394c604b601a50dd03159050df1e7dc91f8c4471d6',
            ],
            sizeBytes: 184985387,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:ca896e22f12244f93b8a52361c8ae68323932d9aef3819dd23acbae7fae8e0b6',
              'eu.gcr.io/kyma-project/busola-web:PR-1320',
            ],
            sizeBytes: 172276982,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:35f403da4d685848f4122766ac273ce1394be1f6a967f317bfb073473ff0fd0a',
              'eu.gcr.io/kyma-project/busola-web:PR-1317',
            ],
            sizeBytes: 172270617,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:af7f37c2eae10264c1714ba356e00c2416fc080398fde607d723d02fa87b0511',
              'eu.gcr.io/kyma-project/busola-web:PR-1336',
            ],
            sizeBytes: 172019587,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/hyperkube@sha256:dd7c70ac226f05434a4133ab479fd3a34225cec78e3da3f2e8c4e61b16ef1740',
            ],
            sizeBytes: 166436389,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/grafana/promtail@sha256:e65d7bbcce8a9ffa8657c74498539bc3abd1501d2db3e45f1a3f6baefa91cb2b',
            ],
            sizeBytes: 161329310,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/proxyv2@sha256:1f8d852989c16345d0e81a7bb49da231ade6b99d51b95c56702d04c417549b26',
              'eu.gcr.io/kyma-project/external/istio/proxyv2:1.13.2-distroless',
            ],
            sizeBytes: 154508522,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/fluent-bit@sha256:13556d11231b88cec67b6329d3ee134e64180c612bef193f036395aa2ad3dc32',
              'eu.gcr.io/kyma-project/tpi/fluent-bit:1.9.3-39c7ed70',
            ],
            sizeBytes: 146863690,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/dd-virtuous-sock@sha256:f5dd07b695f16a2a42ab922bd26154c5838ee173ca72806fe9b9c2c18338d68a',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/dd-virtuous-sock:6f982b6d826f76b95450b858d4e65d27ce46cefe3dda890927108a39e7b6c086',
            ],
            sizeBytes: 133953857,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/lyczeq-alarmed-restaurant@sha256:232f552a5a00836613e0c4dcb9f22a4ea373b11232b3f5bb35a9c6b1708bccb0',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/lyczeq-alarmed-restaurant:81991b5ad44cdabb5ee74afd811f79efb93b705e6818e105001e1e5fdddcae10',
            ],
            sizeBytes: 133953827,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/node-problem-detector/node-problem-detector@sha256:cb0b40d206abff75f906a5d87e8a6a019be0aedc64df5baa6aed6cf1b564073c',
            ],
            sizeBytes: 109835618,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/kube-proxy@sha256:081751bf4df290fd0e48110a9a053f11ff7ed1f77c00863e2c4663bb0b34582d',
            ],
            sizeBytes: 100181346,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/pilot@sha256:84dfdadd316c2b855388359f226d759ede27a0d4aa70c793346ed63cf31f5583',
              'eu.gcr.io/kyma-project/external/istio/pilot:1.13.2-distroless',
            ],
            sizeBytes: 95973166,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/envoyproxy/envoy-alpine@sha256:66410d7cf6b7fac49500444a26905d7a0943852b840531aecd0d9b951485a5c5',
            ],
            sizeBytes: 73238339,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-backend@sha256:6e2f3c272bf543235d5d990d6e18a5f479dd04c8e5cc7fe7b1a42acddacf204d',
              'eu.gcr.io/kyma-project/busola-backend:PR-1237',
            ],
            sizeBytes: 69719263,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-backend@sha256:99585f0a30bb6557dd3b1cec686791ecde22dd99a7db89468928cb6ee1311bb6',
              'eu.gcr.io/kyma-project/busola-backend:PR-1310',
            ],
            sizeBytes: 69716096,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-backend@sha256:15468e86e3dca6922e60bc28d66250fa2e0f1389edecc16796dcb73194b6980d',
              'eu.gcr.io/kyma-project/busola-backend:PR-1320',
            ],
            sizeBytes: 69716096,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-backend@sha256:64821d6918a7ce76927e5a991a07c41b8ff239684b2c0f6f1ddac436787e820a',
              'eu.gcr.io/kyma-project/busola-backend:PR-1336',
            ],
            sizeBytes: 69714464,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/k8s-tools@sha256:232af0b9152b94a2730e85b57887b0765898368b31e694075575bab0cdb125b1',
              'eu.gcr.io/kyma-project/tpi/k8s-tools:20220426-5e9a4f50',
            ],
            sizeBytes: 62889993,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/minio/minio@sha256:ad651bcf3157e0328ce664c70f1388e1d73e59f34c8bb63e5a8aa56afa0e1820',
              'eu.gcr.io/kyma-project/tpi/minio/minio:RELEASE.2021-04-22T15-44-28Z-ec157b48',
            ],
            sizeBytes: 61124418,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/prometheus/alertmanager@sha256:3915fd90525daa23260082194e3ca8a75c51af5d436b64eeff16f0c7e54ef829',
              'eu.gcr.io/kyma-project/external/quay.io/prometheus/alertmanager:v0.23.0',
            ],
            sizeBytes: 57534389,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/eventing-controller@sha256:216507d1e6b0f2a4888bc5ac86f8793c716cda5fd4ef248aaabcab2c24a8a54e',
              'eu.gcr.io/kyma-project/eventing-controller:91da5162',
            ],
            sizeBytes: 52311564,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/coredns/coredns@sha256:d9ade183bb90db0de47bdce04727fbe535adce52b858c1aa437f774684998a8a',
            ],
            sizeBytes: 49544931,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/prometheus-operator/prometheus-operator@sha256:ebb1bf081f46269ea32c75def18e1bad637d32020b87d341ad58b3a5c9b9ee79',
              'eu.gcr.io/kyma-project/external/quay.io/prometheus-operator/prometheus-operator:v0.53.1',
            ],
            sizeBytes: 49390675,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/quay.io/coreos/etcd@sha256:dd60f249c777c9e2412c0cc80d7e2ce6303e49da16f3f7638ac56ac272978371',
              'eu.gcr.io/kyma-project/tpi/quay.io/coreos/etcd:v3.3.27-979d1ebd',
            ],
            sizeBytes: 48277569,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/event-publisher-proxy@sha256:fce85d6cddb19cb0881e17adac9377b296b5f35bcdca67b618197cb29ff61a27',
              'eu.gcr.io/kyma-project/event-publisher-proxy:a60a0f36',
            ],
            sizeBytes: 46643666,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/function-webhook@sha256:fbdb115baaf5ad55dfc1e257a85993542f2965fe40758018ec05914a359bedc6',
              'eu.gcr.io/kyma-project/function-webhook:a56411a8',
            ],
            sizeBytes: 43732431,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/kubernetes-service-catalog/service-catalog@sha256:9b91a63e5f8661a0e71fd40f66bda4c599e8489c6819bb88bec86969ff2b4e74',
              'eu.gcr.io/kyma-project/external/quay.io/kubernetes-service-catalog/service-catalog:v0.3.1-12-g880e400-dirty',
            ],
            sizeBytes: 41526176,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/function-controller@sha256:ff72315737950437c417db47e5b99674495bccda6918ed05469a910856743ad7',
              'eu.gcr.io/kyma-project/function-controller:a56411a8',
            ],
            sizeBytes: 40410957,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/helm-broker-webhook@sha256:802601154590d2e2bdaff4df19ad660963bfec3b0e8193ae1fa1012aee95382c',
              'eu.gcr.io/kyma-project/helm-broker-webhook:7e9eee5e',
            ],
            sizeBytes: 40283314,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/k8s.gcr.io/kube-state-metrics/kube-state-metrics@sha256:d964b5107fb31e9020db0d3e738ba4e1fc83a242638ee7e0ae78939baaedbe59',
              'eu.gcr.io/kyma-project/external/k8s.gcr.io/kube-state-metrics/kube-state-metrics:v2.3.0',
            ],
            sizeBytes: 38660496,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/rafter-upload-service@sha256:853b223656f103e5b5054d9e1a5ac8c394c13a092d983099def813c6cd507b30',
              'eu.gcr.io/kyma-project/rafter-upload-service:f8031ac4',
            ],
            sizeBytes: 37413409,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/incubator/podpreset-webhook@sha256:9c874e302d631cfca671946fa0bd949e9f0afaeb319cf82747819d51733db0f0',
              'eu.gcr.io/kyma-project/incubator/podpreset-webhook:663a99a3',
            ],
            sizeBytes: 37395369,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper@sha256:29fa588aa3bda79c5c668c91992a0bd446c453244906d9512c31416705b9a7a1',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper:v0.38.15-alpine',
            ],
            sizeBytes: 36981228,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/hydra-maester@sha256:281099c500277d69587831a2f997835284d347debb5d58b08e1484659757e40e',
              'eu.gcr.io/kyma-project/external/oryd/hydra-maester:v0.0.24',
            ],
            sizeBytes: 36954525,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/hydra@sha256:85691bc7cc62935a89977d1fd657e46e6694ac696246929b862f716da84f2258',
              'eu.gcr.io/kyma-project/external/oryd/hydra:v1.10.7-sqlite',
            ],
            sizeBytes: 35736155,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester@sha256:8e7015f50356ddbbab52d2b8fb07b8faa952c1aaeae9d7a2a32244ce85178afb',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester:v0.1.5',
            ],
            sizeBytes: 32642089,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/oauth2-proxy@sha256:61ff8c3f8d1ed75476e0bf9eb501f3b603893e85bdb9c6790ab9c82f9eb85c2b',
              'eu.gcr.io/kyma-project/tpi/oauth2-proxy:7.2.1-581a4014',
            ],
            sizeBytes: 28494327,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/quay_io/prometheus/node-exporter@sha256:eeed365560149e3d390eafd6ce8154bcde401aed06f18e6ceedc01cbeadf0bc3',
            ],
            sizeBytes: 26430341,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/pod2daemon-flexvol@sha256:d03951c7f1d8fd2867ab25baa43e81c5d35ce75167b6bf4298bb465479804d22',
            ],
            sizeBytes: 19658066,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/node-exporter@sha256:7ad2ddeab222963d19bf2ef3e3e366140f30caf9f4ca81f4826ad8f1add70878',
              'eu.gcr.io/kyma-project/tpi/node-exporter:1.3.1-581a4014',
            ],
            sizeBytes: 18230098,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/nats@sha256:bed4f10253c279b665399962dd8a61466115c3e1e9acd74470e29f955c4dc923',
              'eu.gcr.io/kyma-project/external/nats:2.7.4-alpine-2022-04-05',
            ],
            sizeBytes: 17818184,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/livenessprobe@sha256:74cf44ec517409f7d5d8fc59dc738cf3b917497469daa4812a11f54b3adce844',
            ],
            sizeBytes: 17112202,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/csi-node-driver-registrar@sha256:c83cbdbff6b49ce121691081d58746e9f257261089c557919cc94a64205232df',
            ],
            sizeBytes: 16322467,
          },
        ],
        volumesInUse: [
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--72d241e1-5156-428f-a7a7-455c1c197ab8',
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--96e1b1fa-1f12-4699-b2a7-b675b8ace4a1',
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--d358be59-6a37-4e52-b26e-9ec35ba429a8',
        ],
        volumesAttached: [
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--72d241e1-5156-428f-a7a7-455c1c197ab8',
            devicePath: '',
          },
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--96e1b1fa-1f12-4699-b2a7-b675b8ace4a1',
            devicePath: '',
          },
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--d358be59-6a37-4e52-b26e-9ec35ba429a8',
            devicePath: '',
          },
        ],
      },
    },
    {
      metadata: {
        name: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j',
        uid: '77bb3498-21d7-444f-88b7-d4374a5a37a5',
        resourceVersion: '13778348',
        creationTimestamp: '2022-06-02T03:03:36Z',
        labels: {
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'n2-standard-8',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'europe-west4',
          'failure-domain.beta.kubernetes.io/zone': 'europe-west4-b',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j',
          'kubernetes.io/os': 'linux',
          'node.kubernetes.io/instance-type': 'n2-standard-8',
          'node.kubernetes.io/role': 'node',
          'topology.gke.io/zone': 'europe-west4-b',
          'topology.kubernetes.io/region': 'europe-west4',
          'topology.kubernetes.io/zone': 'europe-west4-b',
          'worker.garden.sapcloud.io/group': 'worker-dev',
          'worker.gardener.cloud/kubernetes-version': '1.21.10',
          'worker.gardener.cloud/pool': 'worker-dev',
          'worker.gardener.cloud/system-components': 'true',
        },
        annotations: {
          'checksum/cloud-config-data':
            '433e02dd607b177c1b45b9fcfe120c07a11933dff29eb05c327683b7562bc01e',
          'csi.volume.kubernetes.io/nodeid':
            '{"pd.csi.storage.gke.io":"projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/instances/shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j"}',
          'node.alpha.kubernetes.io/ttl': '0',
          'node.machine.sapcloud.io/last-applied-anno-labels-taints':
            '{"metadata":{"creationTimestamp":null,"labels":{"node.kubernetes.io/role":"node","worker.garden.sapcloud.io/group":"worker-dev","worker.gardener.cloud/pool":"worker-dev","worker.gardener.cloud/system-components":"true"}},"spec":{}}',
          'projectcalico.org/IPv4Address': '10.250.0.94/32',
          'projectcalico.org/IPv4IPIPTunnelAddr': '100.96.1.1',
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true',
        },
        managedFields: [
          {
            manager: 'gcp-cloud-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:41Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:labels': {
                  'f:beta.kubernetes.io/instance-type': {},
                  'f:failure-domain.beta.kubernetes.io/region': {},
                  'f:failure-domain.beta.kubernetes.io/zone': {},
                  'f:node.kubernetes.io/instance-type': {},
                  'f:topology.kubernetes.io/region': {},
                  'f:topology.kubernetes.io/zone': {},
                },
              },
              'f:spec': { 'f:providerID': {} },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    '.': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'machine-controller',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:41Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:node.machine.sapcloud.io/last-applied-anno-labels-taints': {},
                },
                'f:labels': {
                  'f:node.kubernetes.io/role': {},
                  'f:worker.garden.sapcloud.io/group': {},
                  'f:worker.gardener.cloud/pool': {},
                  'f:worker.gardener.cloud/system-components': {},
                },
              },
            },
          },
          {
            manager: 'calico-node',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:38Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:projectcalico.org/IPv4Address': {},
                  'f:projectcalico.org/IPv4IPIPTunnelAddr': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                  },
                },
              },
            },
          },
          {
            manager: 'node-problem-detector',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:42Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:status': {
                'f:conditions': {
                  'k:{"type":"CorruptDockerOverlay2"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentContainerdRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentDockerRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentKubeletRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentUnregisterNetDevice"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"KernelDeadlock"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"ReadonlyFilesystem"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kubelet',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:05:57Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:csi.volume.kubernetes.io/nodeid': {},
                  'f:volumes.kubernetes.io/controller-managed-attach-detach': {},
                },
                'f:labels': {
                  '.': {},
                  'f:beta.kubernetes.io/arch': {},
                  'f:beta.kubernetes.io/os': {},
                  'f:kubernetes.io/arch': {},
                  'f:kubernetes.io/hostname': {},
                  'f:kubernetes.io/os': {},
                  'f:topology.gke.io/zone': {},
                  'f:worker.gardener.cloud/kubernetes-version': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"DiskPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"MemoryPressure"}': {
                    'f:lastHeartbeatTime': {},
                  },
                  'k:{"type":"PIDPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"Ready"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                  },
                },
                'f:images': {},
                'f:volumesInUse': {},
              },
            },
          },
          {
            manager: 'kube-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:06:03Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:node.alpha.kubernetes.io/ttl': {} },
              },
              'f:spec': {
                'f:podCIDR': {},
                'f:podCIDRs': { '.': {}, 'v:"100.96.1.0/24"': {} },
              },
              'f:status': { 'f:volumesAttached': {} },
            },
          },
          {
            manager: 'kubectl-annotate',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:08:39Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:checksum/cloud-config-data': {} },
              },
            },
          },
        ],
      },
      spec: {
        podCIDR: '100.96.1.0/24',
        podCIDRs: ['100.96.1.0/24'],
        providerID:
          'gce://sap-se-cx-kyma-swinka/europe-west4-b/shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j',
      },
      status: {
        capacity: {
          cpu: '8',
          'ephemeral-storage': '60748640Ki',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '32884952Ki',
          pods: '110',
        },
        allocatable: {
          cpu: '7920m',
          'ephemeral-storage': '59096276946',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '31733976Ki',
          pods: '110',
        },
        conditions: [
          {
            type: 'FrequentDockerRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'NoFrequentDockerRestart',
            message: 'docker is functioning properly',
          },
          {
            type: 'FrequentContainerdRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'NoFrequentContainerdRestart',
            message: 'containerd is functioning properly',
          },
          {
            type: 'KernelDeadlock',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'KernelHasNoDeadlock',
            message: 'kernel has no deadlock',
          },
          {
            type: 'ReadonlyFilesystem',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'FilesystemIsNotReadOnly',
            message: 'Filesystem is not read-only',
          },
          {
            type: 'CorruptDockerOverlay2',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'NoCorruptDockerOverlay2',
            message: 'docker overlay2 is functioning properly',
          },
          {
            type: 'FrequentUnregisterNetDevice',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'NoFrequentUnregisterNetDevice',
            message: 'node is functioning properly',
          },
          {
            type: 'FrequentKubeletRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:26:33Z',
            lastTransitionTime: '2022-06-02T03:05:53Z',
            reason: 'NoFrequentKubeletRestart',
            message: 'kubelet is functioning properly',
          },
          {
            type: 'NetworkUnavailable',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T03:04:38Z',
            lastTransitionTime: '2022-06-02T03:04:38Z',
            reason: 'CalicoIsUp',
            message: 'Calico is running on this node',
          },
          {
            type: 'MemoryPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:36Z',
            reason: 'KubeletHasSufficientMemory',
            message: 'kubelet has sufficient memory available',
          },
          {
            type: 'DiskPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:36Z',
            reason: 'KubeletHasNoDiskPressure',
            message: 'kubelet has no disk pressure',
          },
          {
            type: 'PIDPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:36Z',
            reason: 'KubeletHasSufficientPID',
            message: 'kubelet has sufficient PID available',
          },
          {
            type: 'Ready',
            status: 'True',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:04:36Z',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status. AppArmor enabled',
          },
        ],
        addresses: [
          {
            type: 'InternalIP',
            address: '10.250.0.94',
          },
          {
            type: 'Hostname',
            address: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j',
          },
        ],
        daemonEndpoints: {
          kubeletEndpoint: {
            Port: 10250,
          },
        },
        nodeInfo: {
          machineID: '79b4c6c1fea8dde90981860f70a436fd',
          systemUUID: '79b4c6c1-fea8-dde9-0981-860f70a436fd',
          bootID: '06169fe6-4eae-49e2-be74-484d27461590',
          kernelVersion: '5.10.109-garden-cloud-amd64',
          osImage: 'Garden Linux 576.8',
          containerRuntimeVersion: 'docker://20.10.11+dfsg1',
          kubeletVersion: 'v1.21.10',
          kubeProxyVersion: 'v1.21.10',
          operatingSystem: 'linux',
          architecture: 'amd64',
        },
        images: [
          {
            names: [
              'mysql@sha256:0fd2898dc1c946b34dceaccc3b80d38b1049285c1dab70df7480de62265d6213',
              'mysql:8.0.22',
            ],
            sizeBytes: 545305069,
          },
          {
            names: [
              'kennethreitz/httpbin@sha256:599fe5e5073102dbb0ee3dbb65f049dab44fa9fc251f6835c9990f8fb196a72b',
              'kennethreitz/httpbin:latest',
            ],
            sizeBytes: 533675008,
          },
          {
            names: [
              'kubevious/backend@sha256:e40e07efbd28f28c0ff85ea3482270bc0355db9a07665cbbb5253f72215fceab',
              'kubevious/backend:1.0.6',
            ],
            sizeBytes: 244203156,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/cni@sha256:39472ef8a62f22e9651c9c639551c4a882e34922629f8fadd12c6154fc5a1b10',
            ],
            sizeBytes: 233749645,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/node@sha256:9bf69736030adcfe20c6a27dbef4e474113591bdf8195b598f287245166df8f6',
            ],
            sizeBytes: 197928711,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/grafana@sha256:b89048cc7b5947de673c143ca4520943d5cf818a29761a5629a4e19ade88ed56',
              'eu.gcr.io/kyma-project/tpi/grafana:7.5.15-581a4014',
            ],
            sizeBytes: 192532006,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/telemetry-operator@sha256:a8a1b049f140232a119f915214c3ef8336adbfa429d9f9cb2eca21c787f0f520',
              'eu.gcr.io/kyma-project/telemetry-operator:5bacf9bf',
            ],
            sizeBytes: 190978136,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/gcr_io/gke-release/gcp-compute-persistent-disk-csi-driver@sha256:c19a975323321d1f674baf394c604b601a50dd03159050df1e7dc91f8c4471d6',
            ],
            sizeBytes: 184985387,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:ca896e22f12244f93b8a52361c8ae68323932d9aef3819dd23acbae7fae8e0b6',
              'eu.gcr.io/kyma-project/busola-web:PR-1320',
            ],
            sizeBytes: 172276982,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:af7f37c2eae10264c1714ba356e00c2416fc080398fde607d723d02fa87b0511',
              'eu.gcr.io/kyma-project/busola-web:PR-1336',
            ],
            sizeBytes: 172019587,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/hyperkube@sha256:dd7c70ac226f05434a4133ab479fd3a34225cec78e3da3f2e8c4e61b16ef1740',
            ],
            sizeBytes: 166436389,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/grafana/promtail@sha256:e65d7bbcce8a9ffa8657c74498539bc3abd1501d2db3e45f1a3f6baefa91cb2b',
            ],
            sizeBytes: 161329310,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/proxyv2@sha256:1f8d852989c16345d0e81a7bb49da231ade6b99d51b95c56702d04c417549b26',
              'eu.gcr.io/kyma-project/external/istio/proxyv2:1.13.2-distroless',
            ],
            sizeBytes: 154508522,
          },
          {
            names: [
              'redislabs/redisearch@sha256:57250c0f91e51384cb6db2ac98bb7427731b7996000ef612f482f1dc9ad850c6',
              'redislabs/redisearch:2.0.9',
            ],
            sizeBytes: 153114664,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/fluent-bit@sha256:13556d11231b88cec67b6329d3ee134e64180c612bef193f036395aa2ad3dc32',
              'eu.gcr.io/kyma-project/tpi/fluent-bit:1.9.3-39c7ed70',
            ],
            sizeBytes: 146863690,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/grego-test-function@sha256:67263fb1bd51c44583442ee7d055895bcbd9d2482fc32168996ff73e69e077cf',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/grego-test-function:62df6da394efad116f3e91695b18397285821027dbf7e46053d31b97f7b94abd',
            ],
            sizeBytes: 133953806,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/k8s-sidecar@sha256:0e5130e0cf526df3327d8c894f8fe914bc68f838b6bf5c19e5c9d5a2ecf8e759',
              'eu.gcr.io/kyma-project/tpi/k8s-sidecar:1.15.9-581a4014',
            ],
            sizeBytes: 119776208,
          },
          {
            names: [
              'bitnami/redis@sha256:9ecc1c48d6c74a1a8ec9798dd28e5a1ad91d1defa4048039235a8b2be40cda62',
              'bitnami/redis:3.2.9-r2',
            ],
            sizeBytes: 119393764,
          },
          {
            names: [
              'ealen/echo-server@sha256:40bdbd231af312f51517631c8c4f56df3c9a99bf99791da4bbfc92b79861e156',
              'ealen/echo-server:latest',
            ],
            sizeBytes: 113033619,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/node-problem-detector/node-problem-detector@sha256:cb0b40d206abff75f906a5d87e8a6a019be0aedc64df5baa6aed6cf1b564073c',
            ],
            sizeBytes: 109835618,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/kube-proxy@sha256:081751bf4df290fd0e48110a9a053f11ff7ed1f77c00863e2c4663bb0b34582d',
            ],
            sizeBytes: 100181346,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/pilot@sha256:84dfdadd316c2b855388359f226d759ede27a0d4aa70c793346ed63cf31f5583',
              'eu.gcr.io/kyma-project/external/istio/pilot:1.13.2-distroless',
            ],
            sizeBytes: 95973166,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/envoyproxy/envoy-alpine@sha256:66410d7cf6b7fac49500444a26905d7a0943852b840531aecd0d9b951485a5c5',
            ],
            sizeBytes: 73238339,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/metrics-server/metrics-server@sha256:05afa19dacd4dcb1dd3a5c973e427ed5df2069796c1496f787ad34c6e9d4d1eb',
            ],
            sizeBytes: 63791608,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/k8s-tools@sha256:232af0b9152b94a2730e85b57887b0765898368b31e694075575bab0cdb125b1',
              'eu.gcr.io/kyma-project/tpi/k8s-tools:20220426-5e9a4f50',
            ],
            sizeBytes: 62889993,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/application-operator@sha256:de9e30c3ef03d435619f2bb21e90522c23fafb5955a31f215a30c7cd8816eb3c',
              'eu.gcr.io/kyma-project/application-operator:3f163e8f',
            ],
            sizeBytes: 60940178,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/coredns/coredns@sha256:d9ade183bb90db0de47bdce04727fbe535adce52b858c1aa437f774684998a8a',
            ],
            sizeBytes: 49544931,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/application-broker@sha256:6343ccd7ded512733972caf37101d555bb62184fff3fa7f9fdb713c377ec47da',
              'eu.gcr.io/kyma-project/application-broker:35ab62e8',
            ],
            sizeBytes: 48927501,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/incubator/api-gateway-controller@sha256:0522f90c11f4911bbeffc73417a9313d59572353315c9c65bb047ec656ea7ea4',
              'eu.gcr.io/kyma-project/incubator/api-gateway-controller:9fd030a8',
            ],
            sizeBytes: 47828436,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/central-application-connectivity-validator@sha256:8f7b9ca0f8bc82d43b77c443ce03994dae2825ebf21d99325ad6ba7f97e3de1b',
              'eu.gcr.io/kyma-project/central-application-connectivity-validator:245170b1',
            ],
            sizeBytes: 44840205,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/central-application-gateway@sha256:fad4e2eef853097c6e890f3ea7a5ca80078c92fdf2adad8afae581b94c3482cd',
              'eu.gcr.io/kyma-project/central-application-gateway:6d430445',
            ],
            sizeBytes: 44665607,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/rafter-controller-manager@sha256:2fff355479d0e7bbd12f0ea94b62105096fc17fc798a6e1c5e9bb5f0570f54c4',
              'eu.gcr.io/kyma-project/rafter-controller-manager:f8031ac4',
            ],
            sizeBytes: 44396419,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/application-gateway@sha256:937825e2694462438a2ff37b5f733c53f38e1e0c098cd608aa72404d1c7d0cef',
              'eu.gcr.io/kyma-project/application-gateway:6d430445',
            ],
            sizeBytes: 44263805,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/application-registry@sha256:d80cc0c09803bd35de4ee802f762dce60be62f3ef7ae5e4b89cfc8c487dbfcfc',
              'eu.gcr.io/kyma-project/application-registry:3f163e8f',
            ],
            sizeBytes: 42876763,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/kubernetes-service-catalog/service-catalog@sha256:9b91a63e5f8661a0e71fd40f66bda4c599e8489c6819bb88bec86969ff2b4e74',
              'eu.gcr.io/kyma-project/external/quay.io/kubernetes-service-catalog/service-catalog:v0.3.1-12-g880e400-dirty',
            ],
            sizeBytes: 41526176,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/cpa/cluster-proportional-autoscaler@sha256:02bce6df55bb8efcbb4a53eea14e11d7e6d02718725be7c03b5d5cc80aa3a181',
            ],
            sizeBytes: 40647382,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/cpvpa-amd64@sha256:b372167f18b257bfbaaaa6e451c7c82ea0d9f056138b6e3b3c3eaaf3758ce9b7',
            ],
            sizeBytes: 40618573,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/rafter-asyncapi-service@sha256:7e1e9fad4e95ab96229a0b51ed688b9b08896253ad8dc5bd4a469a0c25b22c48',
              'eu.gcr.io/kyma-project/rafter-asyncapi-service:f8031ac4',
            ],
            sizeBytes: 39605418,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper@sha256:29fa588aa3bda79c5c668c91992a0bd446c453244906d9512c31416705b9a7a1',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper:v0.38.15-alpine',
            ],
            sizeBytes: 36981228,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester@sha256:8e7015f50356ddbbab52d2b8fb07b8faa952c1aaeae9d7a2a32244ce85178afb',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester:v0.1.5',
            ],
            sizeBytes: 32642089,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/quay_io/prometheus/node-exporter@sha256:eeed365560149e3d390eafd6ce8154bcde401aed06f18e6ceedc01cbeadf0bc3',
            ],
            sizeBytes: 26430341,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/pod2daemon-flexvol@sha256:d03951c7f1d8fd2867ab25baa43e81c5d35ce75167b6bf4298bb465479804d22',
            ],
            sizeBytes: 19658066,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/node-exporter@sha256:7ad2ddeab222963d19bf2ef3e3e366140f30caf9f4ca81f4826ad8f1add70878',
              'eu.gcr.io/kyma-project/tpi/node-exporter:1.3.1-581a4014',
            ],
            sizeBytes: 18230098,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/livenessprobe@sha256:74cf44ec517409f7d5d8fc59dc738cf3b917497469daa4812a11f54b3adce844',
            ],
            sizeBytes: 17112202,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/csi-node-driver-registrar@sha256:c83cbdbff6b49ce121691081d58746e9f257261089c557919cc94a64205232df',
            ],
            sizeBytes: 16322467,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/gardener/apiserver-proxy@sha256:77e87c91324498cdc6ef3100f63f83eaf07a03d18065e08b839afa441e1300ef',
            ],
            sizeBytes: 15824194,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/gardener/vpn-shoot-client@sha256:e465d32371c67fb9891946fa5657b868cb23daf0c06942fb822f9f8944cad648',
            ],
            sizeBytes: 15756775,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/gardener/egress-filter-blackholer@sha256:a4fa6a557825ce0807d998dba44382f5c9aa076fce00b5c0329464fdec0126eb',
            ],
            sizeBytes: 15289267,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/rafter-front-matter-service@sha256:1d8040c861a2df23686262c3ea24c1a2002824b8f036ba0010d3fbace9ed9f2e',
              'eu.gcr.io/kyma-project/rafter-front-matter-service:f8031ac4',
            ],
            sizeBytes: 12603016,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/develop/orders-service@sha256:94963b7285f9412e3a98bfd96ce5022df4cbb93954aea3e441c9be2fbd959410',
              'eu.gcr.io/kyma-project/develop/orders-service:68a58069',
            ],
            sizeBytes: 7660585,
          },
        ],
        volumesInUse: [
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--69cdff17-f336-4e74-9f36-fad1598818ea',
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--70d70c9c-ed73-4789-a643-2db0f942eef3',
        ],
        volumesAttached: [
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--70d70c9c-ed73-4789-a643-2db0f942eef3',
            devicePath: '',
          },
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--69cdff17-f336-4e74-9f36-fad1598818ea',
            devicePath: '',
          },
        ],
      },
    },
    {
      metadata: {
        name: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d',
        uid: 'bd851a6a-cf66-4db0-b5cd-4b240a25f44e',
        resourceVersion: '13778347',
        creationTimestamp: '2022-06-02T03:03:47Z',
        labels: {
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'n2-standard-8',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'europe-west4',
          'failure-domain.beta.kubernetes.io/zone': 'europe-west4-b',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d',
          'kubernetes.io/os': 'linux',
          'node.kubernetes.io/instance-type': 'n2-standard-8',
          'node.kubernetes.io/role': 'node',
          'topology.gke.io/zone': 'europe-west4-b',
          'topology.kubernetes.io/region': 'europe-west4',
          'topology.kubernetes.io/zone': 'europe-west4-b',
          'worker.garden.sapcloud.io/group': 'worker-dev',
          'worker.gardener.cloud/kubernetes-version': '1.21.10',
          'worker.gardener.cloud/pool': 'worker-dev',
          'worker.gardener.cloud/system-components': 'true',
        },
        annotations: {
          'checksum/cloud-config-data':
            '433e02dd607b177c1b45b9fcfe120c07a11933dff29eb05c327683b7562bc01e',
          'csi.volume.kubernetes.io/nodeid':
            '{"pd.csi.storage.gke.io":"projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/instances/shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d"}',
          'node.alpha.kubernetes.io/ttl': '0',
          'node.machine.sapcloud.io/last-applied-anno-labels-taints':
            '{"metadata":{"creationTimestamp":null,"labels":{"node.kubernetes.io/role":"node","worker.garden.sapcloud.io/group":"worker-dev","worker.gardener.cloud/pool":"worker-dev","worker.gardener.cloud/system-components":"true"}},"spec":{}}',
          'projectcalico.org/IPv4Address': '10.250.0.93/32',
          'projectcalico.org/IPv4IPIPTunnelAddr': '100.96.2.1',
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true',
        },
        managedFields: [
          {
            manager: 'machine-controller',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:47Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:node.machine.sapcloud.io/last-applied-anno-labels-taints': {},
                },
                'f:labels': {
                  'f:node.kubernetes.io/role': {},
                  'f:worker.garden.sapcloud.io/group': {},
                  'f:worker.gardener.cloud/pool': {},
                  'f:worker.gardener.cloud/system-components': {},
                },
              },
            },
          },
          {
            manager: 'gcp-cloud-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:03:50Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:labels': {
                  'f:beta.kubernetes.io/instance-type': {},
                  'f:failure-domain.beta.kubernetes.io/region': {},
                  'f:failure-domain.beta.kubernetes.io/zone': {},
                  'f:node.kubernetes.io/instance-type': {},
                  'f:topology.kubernetes.io/region': {},
                  'f:topology.kubernetes.io/zone': {},
                },
              },
              'f:spec': { 'f:providerID': {} },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    '.': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'calico-node',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:04:29Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:projectcalico.org/IPv4Address': {},
                  'f:projectcalico.org/IPv4IPIPTunnelAddr': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"NetworkUnavailable"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                  },
                },
              },
            },
          },
          {
            manager: 'node-problem-detector',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:05:01Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:status': {
                'f:conditions': {
                  'k:{"type":"CorruptDockerOverlay2"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentContainerdRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentDockerRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentKubeletRestart"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"FrequentUnregisterNetDevice"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"KernelDeadlock"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"ReadonlyFilesystem"}': {
                    '.': {},
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kubectl-annotate',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:05:35Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:checksum/cloud-config-data': {} },
              },
            },
          },
          {
            manager: 'kubelet',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:05:58Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:csi.volume.kubernetes.io/nodeid': {},
                  'f:volumes.kubernetes.io/controller-managed-attach-detach': {},
                },
                'f:labels': {
                  '.': {},
                  'f:beta.kubernetes.io/arch': {},
                  'f:beta.kubernetes.io/os': {},
                  'f:kubernetes.io/arch': {},
                  'f:kubernetes.io/hostname': {},
                  'f:kubernetes.io/os': {},
                  'f:topology.gke.io/zone': {},
                  'f:worker.gardener.cloud/kubernetes-version': {},
                },
              },
              'f:status': {
                'f:conditions': {
                  'k:{"type":"DiskPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"MemoryPressure"}': {
                    'f:lastHeartbeatTime': {},
                  },
                  'k:{"type":"PIDPressure"}': { 'f:lastHeartbeatTime': {} },
                  'k:{"type":"Ready"}': {
                    'f:lastHeartbeatTime': {},
                    'f:lastTransitionTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                  },
                },
                'f:images': {},
                'f:volumesInUse': {},
              },
            },
          },
          {
            manager: 'kube-controller-manager',
            operation: 'Update',
            apiVersion: 'v1',
            time: '2022-06-02T03:06:05Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': { 'f:node.alpha.kubernetes.io/ttl': {} },
              },
              'f:spec': {
                'f:podCIDR': {},
                'f:podCIDRs': { '.': {}, 'v:"100.96.2.0/24"': {} },
              },
              'f:status': { 'f:volumesAttached': {} },
            },
          },
        ],
      },
      spec: {
        podCIDR: '100.96.2.0/24',
        podCIDRs: ['100.96.2.0/24'],
        providerID:
          'gce://sap-se-cx-kyma-swinka/europe-west4-b/shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d',
      },
      status: {
        capacity: {
          cpu: '8',
          'ephemeral-storage': '60748640Ki',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '32884952Ki',
          pods: '110',
        },
        allocatable: {
          cpu: '7920m',
          'ephemeral-storage': '59096276946',
          'hugepages-1Gi': '0',
          'hugepages-2Mi': '0',
          memory: '31733976Ki',
          pods: '110',
        },
        conditions: [
          {
            type: 'CorruptDockerOverlay2',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'NoCorruptDockerOverlay2',
            message: 'docker overlay2 is functioning properly',
          },
          {
            type: 'FrequentUnregisterNetDevice',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'NoFrequentUnregisterNetDevice',
            message: 'node is functioning properly',
          },
          {
            type: 'KernelDeadlock',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'KernelHasNoDeadlock',
            message: 'kernel has no deadlock',
          },
          {
            type: 'ReadonlyFilesystem',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'FilesystemIsNotReadOnly',
            message: 'Filesystem is not read-only',
          },
          {
            type: 'FrequentKubeletRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'NoFrequentKubeletRestart',
            message: 'kubelet is functioning properly',
          },
          {
            type: 'FrequentDockerRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'NoFrequentDockerRestart',
            message: 'docker is functioning properly',
          },
          {
            type: 'FrequentContainerdRestart',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:25:38Z',
            lastTransitionTime: '2022-06-02T03:05:00Z',
            reason: 'NoFrequentContainerdRestart',
            message: 'containerd is functioning properly',
          },
          {
            type: 'NetworkUnavailable',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T03:04:29Z',
            lastTransitionTime: '2022-06-02T03:04:29Z',
            reason: 'CalicoIsUp',
            message: 'Calico is running on this node',
          },
          {
            type: 'MemoryPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:47Z',
            reason: 'KubeletHasSufficientMemory',
            message: 'kubelet has sufficient memory available',
          },
          {
            type: 'DiskPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:47Z',
            reason: 'KubeletHasNoDiskPressure',
            message: 'kubelet has no disk pressure',
          },
          {
            type: 'PIDPressure',
            status: 'False',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:03:47Z',
            reason: 'KubeletHasSufficientPID',
            message: 'kubelet has sufficient PID available',
          },
          {
            type: 'Ready',
            status: 'True',
            lastHeartbeatTime: '2022-06-02T08:29:36Z',
            lastTransitionTime: '2022-06-02T03:04:28Z',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status. AppArmor enabled',
          },
        ],
        addresses: [
          {
            type: 'InternalIP',
            address: '10.250.0.93',
          },
          {
            type: 'Hostname',
            address: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d',
          },
        ],
        daemonEndpoints: {
          kubeletEndpoint: {
            Port: 10250,
          },
        },
        nodeInfo: {
          machineID: 'd03260e381a692a2e48da336b06d8d5d',
          systemUUID: 'd03260e3-81a6-92a2-e48d-a336b06d8d5d',
          bootID: 'ff466329-790f-42b1-9d27-577fe42cf3e5',
          kernelVersion: '5.10.109-garden-cloud-amd64',
          osImage: 'Garden Linux 576.8',
          containerRuntimeVersion: 'docker://20.10.11+dfsg1',
          kubeletVersion: 'v1.21.10',
          kubeProxyVersion: 'v1.21.10',
          operatingSystem: 'linux',
          architecture: 'amd64',
        },
        images: [
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/cni@sha256:39472ef8a62f22e9651c9c639551c4a882e34922629f8fadd12c6154fc5a1b10',
            ],
            sizeBytes: 233749645,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/prometheus/prometheus@sha256:82252381f9645bfdb0d0cee6dbe05505d86b9a784d4d0004e8b731705fb0ce11',
              'eu.gcr.io/kyma-project/external/quay.io/prometheus/prometheus:v2.32.1',
            ],
            sizeBytes: 200839287,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/node@sha256:9bf69736030adcfe20c6a27dbef4e474113591bdf8195b598f287245166df8f6',
            ],
            sizeBytes: 197928711,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/gcr_io/gke-release/gcp-compute-persistent-disk-csi-driver@sha256:c19a975323321d1f674baf394c604b601a50dd03159050df1e7dc91f8c4471d6',
            ],
            sizeBytes: 184985387,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:ca896e22f12244f93b8a52361c8ae68323932d9aef3819dd23acbae7fae8e0b6',
              'eu.gcr.io/kyma-project/busola-web:PR-1320',
            ],
            sizeBytes: 172276982,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:af7f37c2eae10264c1714ba356e00c2416fc080398fde607d723d02fa87b0511',
              'eu.gcr.io/kyma-project/busola-web:PR-1336',
            ],
            sizeBytes: 172019587,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/busola-web@sha256:3c9c5714434344255806e7f6f1778e389d9a367da6485b9424b349c5cbee24bd',
              'eu.gcr.io/kyma-project/busola-web:PR-1228',
            ],
            sizeBytes: 171770146,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/hyperkube@sha256:dd7c70ac226f05434a4133ab479fd3a34225cec78e3da3f2e8c4e61b16ef1740',
            ],
            sizeBytes: 166436389,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/grafana/promtail@sha256:e65d7bbcce8a9ffa8657c74498539bc3abd1501d2db3e45f1a3f6baefa91cb2b',
            ],
            sizeBytes: 161329310,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/proxyv2@sha256:1f8d852989c16345d0e81a7bb49da231ade6b99d51b95c56702d04c417549b26',
              'eu.gcr.io/kyma-project/external/istio/proxyv2:1.13.2-distroless',
            ],
            sizeBytes: 154508522,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/helm-controller@sha256:71ca6140ddeb6a2cdf1ba5c8e3f490502feb3e91789e03ef3974cefa249ff320',
              'eu.gcr.io/kyma-project/helm-controller:7e9eee5e',
            ],
            sizeBytes: 151073774,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/fluent-bit@sha256:13556d11231b88cec67b6329d3ee134e64180c612bef193f036395aa2ad3dc32',
              'eu.gcr.io/kyma-project/tpi/fluent-bit:1.9.3-39c7ed70',
            ],
            sizeBytes: 146863690,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-impressionable-march@sha256:473851e7ac60ca4707babf83d00851ab1c387899f7521ed2c639c6b007bcfd2a',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-impressionable-march:c277cac235cb6ff52d81353ac12f7ba6e2bdd147aedd36ff6baa890542daf068',
            ],
            sizeBytes: 133953835,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/kyma-system-truthful-article@sha256:df707f6525f8b908aa936ab9eb6b42e711dc3610cef8031e701b87e9537cc1b7',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/kyma-system-truthful-article:d9b295e5fccda43ae1824bcb1eb43148a6e1a576c26a340b7f2c45c4ea502e24',
            ],
            sizeBytes: 133953818,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-fdf@sha256:97ac310d889a2bc445b3ab4d732bbf0dcdae4eef7345c2db812d158c0c194609',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-fdf:b5469fce0b624ad923396df010a14230562a900ba8d95cd497a92d8437fdb0b1',
            ],
            sizeBytes: 133953767,
          },
          {
            names: [
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-ds@sha256:e9006d811faa6f61057d9700e65a6bbbeeb4dc89bcceee10c5f43613db3d6ab3',
              'registry.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/default-ds:410088a2e094257aa88b9dddcfb6f0fff7cc7341ba63da530d751541fb20cd18',
            ],
            sizeBytes: 133953763,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/kube-controllers@sha256:1a90641c88b004d316e1a06b658fb043741c5c790462e5d44277ad9ce1cf83f3',
            ],
            sizeBytes: 129939061,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/typha@sha256:5b527ca38e9c8ad2578022a6af61e52cbf93e08bf5487876a5d716451d8dd8e4',
            ],
            sizeBytes: 125561954,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/kiali@sha256:2113946ba8744199dd191fde8d4ea5b0476ebb873a9b1e69cc4c0e4601cdfe44',
              'eu.gcr.io/kyma-project/tpi/kiali:1.49.0-b79686f9',
            ],
            sizeBytes: 111698530,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/node-problem-detector/node-problem-detector@sha256:cb0b40d206abff75f906a5d87e8a6a019be0aedc64df5baa6aed6cf1b564073c',
            ],
            sizeBytes: 109835618,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/kube-proxy@sha256:081751bf4df290fd0e48110a9a053f11ff7ed1f77c00863e2c4663bb0b34582d',
            ],
            sizeBytes: 100181346,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/istio/pilot@sha256:84dfdadd316c2b855388359f226d759ede27a0d4aa70c793346ed63cf31f5583',
              'eu.gcr.io/kyma-project/external/istio/pilot:1.13.2-distroless',
            ],
            sizeBytes: 95973166,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/envoyproxy/envoy-alpine@sha256:66410d7cf6b7fac49500444a26905d7a0943852b840531aecd0d9b951485a5c5',
            ],
            sizeBytes: 73238339,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/k8s-tools@sha256:232af0b9152b94a2730e85b57887b0765898368b31e694075575bab0cdb125b1',
              'eu.gcr.io/kyma-project/tpi/k8s-tools:20220426-5e9a4f50',
            ],
            sizeBytes: 62889993,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/loki@sha256:04da07db34a66568a5870faa46948b36af0ecbeea83ad0781ddf29aa18e4495a',
              'eu.gcr.io/kyma-project/tpi/loki:2.2.1-581a4014',
            ],
            sizeBytes: 59735663,
          },
          {
            names: [
              'kubevious/ui@sha256:e2d62acf31597d126a11cccd0ca4a3a447909e751b18df5e0f9de4ceb07a7bb1',
              'kubevious/ui:1.0.5',
            ],
            sizeBytes: 59020591,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/jaegertracing/all-in-one@sha256:c508510108e680c8b79625b42120d3bdf580050fc3d79ad15110151407388fca',
              'eu.gcr.io/kyma-project/external/jaegertracing/all-in-one:1.30.0',
            ],
            sizeBytes: 57528635,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/helm-broker@sha256:817910c4654f35fe991d480118e6a7631d977d1f85f7461892487e6a96763924',
              'eu.gcr.io/kyma-project/helm-broker:7e9eee5e',
            ],
            sizeBytes: 56693378,
          },
          {
            names: [
              'ghcr.io/sap/sap-btp-service-operator/controller@sha256:5078d3ac8933cdaca0d54403eb91d4a17dd7db6924a626a4ca49756c9d05d095',
              'ghcr.io/sap/sap-btp-service-operator/controller:v0.2.5',
            ],
            sizeBytes: 52694500,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/jaeger-operator@sha256:1320dd10b7fc8d239982f5b47bd0513fbfa2f01bb36cae4ab98c83d3b851c41a',
              'eu.gcr.io/kyma-project/tpi/jaeger-operator:1.30.0-bc31ec4c',
            ],
            sizeBytes: 52486486,
          },
          {
            names: [
              'quay.io/brancz/kube-rbac-proxy@sha256:b62289c3f3f883ee76dd4e8879042dd19abff743340e451cb59f9654fc472e4f',
              'quay.io/brancz/kube-rbac-proxy:v0.11.0',
            ],
            sizeBytes: 46556979,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/application-gateway@sha256:937825e2694462438a2ff37b5f733c53f38e1e0c098cd608aa72404d1c7d0cef',
              'eu.gcr.io/kyma-project/application-gateway:6d430445',
            ],
            sizeBytes: 44263805,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/connection-token-handler@sha256:fb3b760da6c9d555e11c802df379322ad1c9e42eaf8e7b848666061f41852ab9',
              'eu.gcr.io/kyma-project/connection-token-handler:245170b1',
            ],
            sizeBytes: 43519357,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/service-binding-usage-controller@sha256:5e180d107a53a60df6e9c37de45f2c78ebae1d818631ab24f22cc30081b40592',
              'eu.gcr.io/kyma-project/service-binding-usage-controller:75da62ce',
            ],
            sizeBytes: 39001456,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/connector-service@sha256:c559a0feecb18db0a34541dc5ce5f53d22300f752abe1252ffde6fee262da6c5',
              'eu.gcr.io/kyma-project/connector-service:ae096c4a',
            ],
            sizeBytes: 37453290,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper@sha256:29fa588aa3bda79c5c668c91992a0bd446c453244906d9512c31416705b9a7a1',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper:v0.38.15-alpine',
            ],
            sizeBytes: 36981228,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester@sha256:8e7015f50356ddbbab52d2b8fb07b8faa952c1aaeae9d7a2a32244ce85178afb',
              'eu.gcr.io/kyma-project/external/oryd/oathkeeper-maester:v0.1.5',
            ],
            sizeBytes: 32642089,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/oauth2-proxy@sha256:61ff8c3f8d1ed75476e0bf9eb501f3b603893e85bdb9c6790ab9c82f9eb85c2b',
              'eu.gcr.io/kyma-project/tpi/oauth2-proxy:7.2.1-581a4014',
            ],
            sizeBytes: 28494327,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/quay_io/prometheus/node-exporter@sha256:eeed365560149e3d390eafd6ce8154bcde401aed06f18e6ceedc01cbeadf0bc3',
            ],
            sizeBytes: 26430341,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/registry@sha256:bc5818444409db0d5338657d94147224f72ba5288ac03f02b4c4cebf82dade3d',
              'eu.gcr.io/kyma-project/tpi/registry:2.7.1-7034b159',
            ],
            sizeBytes: 23991056,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/quay_io/prometheus/blackbox-exporter@sha256:c1670d4e0bf0f8a2fa81a5b99d2f236032472a0a8c27f9810c79c7571a7209cb',
            ],
            sizeBytes: 20909963,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/registry-1_docker_io/calico/pod2daemon-flexvol@sha256:d03951c7f1d8fd2867ab25baa43e81c5d35ce75167b6bf4298bb465479804d22',
            ],
            sizeBytes: 19658066,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/tpi/node-exporter@sha256:7ad2ddeab222963d19bf2ef3e3e366140f30caf9f4ca81f4826ad8f1add70878',
              'eu.gcr.io/kyma-project/tpi/node-exporter:1.3.1-581a4014',
            ],
            sizeBytes: 18230098,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/livenessprobe@sha256:74cf44ec517409f7d5d8fc59dc738cf3b917497469daa4812a11f54b3adce844',
            ],
            sizeBytes: 17112202,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/k8s_gcr_io/sig-storage/csi-node-driver-registrar@sha256:c83cbdbff6b49ce121691081d58746e9f257261089c557919cc94a64205232df',
            ],
            sizeBytes: 16322467,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/gardener/apiserver-proxy@sha256:77e87c91324498cdc6ef3100f63f83eaf07a03d18065e08b839afa441e1300ef',
            ],
            sizeBytes: 15824194,
          },
          {
            names: [
              'eu.gcr.io/sap-se-gcr-k8s-public/eu_gcr_io/gardener-project/gardener/egress-filter-blackholer@sha256:a4fa6a557825ce0807d998dba44382f5c9aa076fce00b5c0329464fdec0126eb',
            ],
            sizeBytes: 15289267,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/quay.io/prometheus-operator/prometheus-config-reloader@sha256:0c5057bde3a2cb4dc2f4e2af756c9a8df1888723509f9607bd100466b446724c',
              'eu.gcr.io/kyma-project/external/quay.io/prometheus-operator/prometheus-config-reloader:v0.53.1',
            ],
            sizeBytes: 12162131,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/external/jimmidyson/configmap-reload@sha256:91467ba755a0c41199a63fe80a2c321c06edc4d3affb4f0ab6b3d20a49ed88d1',
              'eu.gcr.io/kyma-project/external/jimmidyson/configmap-reload:v0.5.0',
            ],
            sizeBytes: 9988981,
          },
          {
            names: [
              'eu.gcr.io/kyma-project/pr/orders-service@sha256:7154c85a014218c162cb48035f4edc7eea14d586de76431d63166bb32bf4cbe9',
              'eu.gcr.io/kyma-project/pr/orders-service:PR-162',
            ],
            sizeBytes: 7660585,
          },
        ],
        volumesInUse: [
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--04b9abdb-2deb-4c1e-83b9-bd84511a3f2a',
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--13366dcc-5f4e-4591-bda4-266a355a4f70',
          'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--77538826-9a16-4e20-8758-b940d05ceff4',
        ],
        volumesAttached: [
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--04b9abdb-2deb-4c1e-83b9-bd84511a3f2a',
            devicePath: '',
          },
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--13366dcc-5f4e-4591-bda4-266a355a4f70',
            devicePath: '',
          },
          {
            name:
              'kubernetes.io/csi/pd.csi.storage.gke.io^projects/sap-se-cx-kyma-swinka/zones/europe-west4-b/disks/pv--77538826-9a16-4e20-8758-b940d05ceff4',
            devicePath: '',
          },
        ],
      },
    },
  ],
});
