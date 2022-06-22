export const schema = {
  rules: [
    {
      id: 1,
      uniqueName: 'CONTAINERS_MISSING_IMAGE_VALUE_VERSION',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-image-pinned-version',
      messageOnFailure:
        'Incorrect value for key `image` - specify an image version to avoid unpleasant "version surprises" in the future',
      category: 'Containers',
      schema: {
        definitions: {
          imageValuePattern: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          image: {
                            pattern: '@sha.*|:(w|.|-)+$',
                            not: {
                              pattern: '.*:(latest|LATEST)$',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            else: false,
          },
        },
        allOf: [
          {
            $ref: '#/definitions/imageValuePattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 2,
      name: 'Ensure each container has a configured memory request',
      uniqueName: 'CONTAINERS_MISSING_MEMORY_REQUEST_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-memory-request',
      messageOnFailure:
        'Missing property object `requests.memory` - value should be within the accepted boundaries recommended by the organization',
      category: 'Containers',
      schema: {
        definitions: {
          memoryRequestPattern: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          resources: {
                            properties: {
                              requests: {
                                type: 'object',
                                properties: {
                                  memory: {
                                    type: ['string', 'number'],
                                  },
                                },
                                required: ['memory'],
                              },
                            },
                            required: ['requests'],
                          },
                        },
                        required: ['resources'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/memoryRequestPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 3,
      name: 'Ensure each container has a configured CPU request',
      uniqueName: 'CONTAINERS_MISSING_CPU_REQUEST_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-cpu-request',
      messageOnFailure:
        'Missing property object `requests.cpu` - value should be within the accepted boundaries recommended by the organization',
      category: 'Containers',
      schema: {
        definitions: {
          cpuRequestPattern: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          resources: {
                            properties: {
                              requests: {
                                type: 'object',
                                properties: {
                                  cpu: {
                                    type: ['string', 'number'],
                                  },
                                },
                                required: ['cpu'],
                              },
                            },
                            required: ['requests'],
                          },
                        },
                        required: ['resources'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/cpuRequestPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 4,
      name: 'Ensure each container has a configured memory limit',
      uniqueName: 'CONTAINERS_MISSING_MEMORY_LIMIT_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-memory-limit',
      messageOnFailure:
        'Missing property object `limits.memory` - value should be within the accepted boundaries recommended by the organization',
      category: 'Containers',
      schema: {
        definitions: {
          memoryLimitPattern: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          resources: {
                            properties: {
                              limits: {
                                type: 'object',
                                properties: {
                                  memory: {
                                    type: ['string', 'number'],
                                  },
                                },
                                required: ['memory'],
                              },
                            },
                            required: ['limits'],
                          },
                        },
                        required: ['resources'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/memoryLimitPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 5,
      name: 'Ensure each container has a configured CPU limit',
      uniqueName: 'CONTAINERS_MISSING_CPU_LIMIT_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-cpu-limit',
      messageOnFailure:
        'Missing property object `limits.cpu` - value should be within the accepted boundaries recommended by the organization',
      category: 'Containers',
      schema: {
        definitions: {
          cpuLimitPattern: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          resources: {
                            properties: {
                              limits: {
                                type: 'object',
                                properties: {
                                  cpu: {
                                    type: ['string', 'number'],
                                  },
                                },
                                required: ['cpu'],
                              },
                            },
                            required: ['limits'],
                          },
                        },
                        required: ['resources'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/cpuLimitPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 6,
      name: 'Prevent Ingress from forwarding all traffic to a single container',
      uniqueName: 'INGRESS_INCORRECT_HOST_VALUE_PERMISSIVE',
      enabledByDefault: true,
      documentationUrl:
        'https://hub.datree.io/prevent-ingress-forwarding-traffic-to-single-container',
      messageOnFailure:
        'Incorrect value for key `host` - specify host instead of using a wildcard character ("*")',
      category: 'Networking',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Ingress'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                rules: {
                  type: 'array',
                  items: {
                    properties: {
                      host: {
                        type: 'string',
                        not: {
                          enum: ['*'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 7,
      name: 'Prevent Service from exposing node port',
      uniqueName: 'SERVICE_INCORRECT_TYPE_VALUE_NODEPORT',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-node-port',
      messageOnFailure:
        'Incorrect value for key `type` - `NodePort` will open a port on all nodes where it can be reached by the network external to the cluster',
      category: 'Networking',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Service'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                type: {
                  type: 'string',
                  not: {
                    enum: ['NodePort'],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 9,
      name: 'Ensure workload has valid label values',
      uniqueName: 'WORKLOAD_INVALID_LABELS_VALUE',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-labels-value-valid',
      messageOnFailure:
        'Incorrect value for key(s) under `labels` - the vales syntax is not valid so the Kubernetes engine will not accept it',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: [
                'Deployment',
                'Pod',
                'DaemonSet',
                'StatefulSet',
                'ReplicaSet',
                'CronJob',
                'Job',
              ],
            },
          },
        },
        then: {
          properties: {
            metadata: {
              properties: {
                labels: {
                  patternProperties: {
                    '^.*$': {
                      format: 'hostname',
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    {
      //TODO: what to do with this one?
      id: 10,
      name: 'Ensure deployment-like resource is using a valid restart policy',
      uniqueName: 'WORKLOAD_INCORRECT_RESTARTPOLICY_VALUE_ALWAYS',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-valid-restart-policy',
      messageOnFailure:
        'Incorrect value for key `restartPolicy` - any other value than `Always` is not supported by this resource',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: [
                'Deployment',
                'ReplicaSet',
                'DaemonSet',
                'ReplicationController',
              ],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                template: {
                  properties: {
                    spec: {
                      properties: {
                        restartPolicy: {
                          enum: ['Always'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 11,
      name: 'Ensure each container has a configured liveness probe',
      uniqueName: 'CONTAINERS_MISSING_LIVENESSPROBE_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-liveness-probe',
      messageOnFailure:
        'Missing property object `livenessProbe` - add a properly configured livenessProbe to catch possible deadlocks',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      items: {
                        required: ['livenessProbe'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 12,
      name: 'Ensure each container has a configured readiness probe',
      uniqueName: 'CONTAINERS_MISSING_READINESSPROBE_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-readiness-probe',
      messageOnFailure:
        'Missing property object `readinessProbe` - add a properly configured readinessProbe to notify kubelet your Pods are ready for traffic',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      items: {
                        required: ['readinessProbe'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 13,
      name: 'Ensure HPA has minimum replicas configured',
      uniqueName: 'HPA_MISSING_MINREPLICAS_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-hpa-minimum-replicas',
      messageOnFailure:
        'Missing property object `minReplicas` - the value should be within the accepted boundaries recommended by the organization',
      category: 'Other',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['HorizontalPodAutoscaler'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              required: ['minReplicas'],
            },
          },
        },
      },
    },
    {
      id: 14,
      name: 'Ensure HPA has maximum replicas configured',
      uniqueName: 'HPA_MISSING_MAXREPLICAS_KEY',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/ensure-hpa-maximum-replicas',
      messageOnFailure:
        'Missing property object `maxReplicas` - the value should be within the accepted boundaries recommended by the organization',
      category: 'Other',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['HorizontalPodAutoscaler'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              required: ['maxReplicas'],
            },
          },
        },
      },
    },
    {
      id: 15,
      name: 'Prevent workload from using the default namespace',
      uniqueName: 'WORKLOAD_INCORRECT_NAMESPACE_VALUE_DEFAULT',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-deafult-namespce',
      messageOnFailure:
        'Incorrect value for key `namespace` - use an explicit namespace instead of the default one (`default`)',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: [
                'Deployment',
                'Pod',
                'DaemonSet',
                'StatefulSet',
                'ReplicaSet',
                'CronJob',
                'Job',
              ],
            },
          },
        },
        then: {
          properties: {
            metadata: {
              properties: {
                namespace: {
                  not: {
                    enum: ['default'],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 16,
      name: 'Ensure Deployment has more than one replica configured',
      uniqueName: 'DEPLOYMENT_INCORRECT_REPLICAS_VALUE',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-minimum-two-replicas',
      messageOnFailure:
        'Incorrect value for key `replicas` - running 2 or more replicas will increase the availability of the service',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Deployment'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                replicas: {
                  minimum: 2,
                },
              },
            },
          },
        },
      },
    },
    {
      id: 17,
      name: 'Ensure CronJob has a configured deadline',
      uniqueName: 'CRONJOB_MISSING_STARTINGDEADLINESECOND_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/ensure-cronjob-deadline',
      messageOnFailure:
        'Missing property object `startingDeadlineSeconds` - set a time limit to the cron execution to allow killing it if exceeded',
      category: 'CronJob',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['CronJob'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                startingDeadlineSeconds: {
                  type: 'number',
                },
              },
              required: ['startingDeadlineSeconds'],
            },
          },
        },
      },
    },
    {
      id: 18,
      name: 'Prevent deprecated APIs in Kubernetes v1.16',
      uniqueName: 'K8S_DEPRECATED_APIVERSION_1.16',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-deprecated-k8s-api-116',
      messageOnFailure:
        'Incorrect value for key `apiVersion` - the version you are trying to use is not supported by the Kubernetes cluster version (>=1.16)',
      category: 'Deprecation',
      schema: {
        properties: {
          apiVersion: {
            type: 'string',
            not: {
              enum: ['extensions/v1beta1', 'apps/v1beta1', 'apps/v1beta2'],
            },
          },
        },
      },
    },
    {
      id: 19,
      name: 'Prevent deprecated APIs in Kubernetes v1.17',
      uniqueName: 'K8S_DEPRECATED_APIVERSION_1.17',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-deprecated-k8s-api-117',
      messageOnFailure:
        'Incorrect value for key `apiVersion` - the version you are trying to use is not supported by the Kubernetes cluster version (>=1.17)',
      category: 'Deprecation',
      schema: {
        properties: {
          apiVersion: {
            type: 'string',
            not: {
              enum: [
                'kubeadm.k8s.io/v1beta1',
                'rbac.authorization.k8s.io/v1alpha1',
                'rbac.authorization.k8s.io/v1beta1',
              ],
            },
          },
        },
      },
    },
    {
      id: 20,
      name: 'Prevent containers from having root access capabilities',
      uniqueName: 'CONTAINERS_INCORRECT_PRIVILEGED_VALUE_TRUE',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-privileged-containers',
      messageOnFailure:
        'Incorrect value for key `privileged` - this mode will allow the container the same access as processes running on the host',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          securityContext: {
                            properties: {
                              privileged: {
                                not: {
                                  enum: [true, 'true'],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 21,
      name: 'Ensure workload has a configured `owner` label',
      uniqueName: 'WORKLOAD_MISSING_LABEL_OWNER_VALUE',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/ensure-owner-label',
      messageOnFailure:
        'Missing label object `owner` - add a proper owner label to know which person/team to ping when needed',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: [
                'Deployment',
                'Pod',
                'DaemonSet',
                'StatefulSet',
                'ReplicaSet',
                'CronJob',
                'Job',
              ],
            },
          },
        },
        then: {
          properties: {
            metadata: {
              properties: {
                labels: {
                  required: ['owner'],
                },
              },
            },
          },
        },
      },
    },
    {
      id: 22,
      name: 'Ensure Deployment has a configured `env` label',
      uniqueName: 'DEPLOYMENT_MISSING_LABEL_ENV_VALUE',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/ensure-env-label',
      messageOnFailure:
        'Missing label object `env` - add a proper environment description (e.g. "prod", "testing", etc.) to the Deployment config',
      category: 'Workload',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Deployment'],
            },
          },
        },
        then: {
          properties: {
            metadata: {
              properties: {
                labels: {
                  required: ['env'],
                },
              },
              required: ['labels'],
            },
          },
          required: ['metadata'],
        },
      },
    },

    {
      id: 24,
      name: 'Prevent CronJob from executing jobs concurrently',
      uniqueName: 'CRONJOB_MISSING_CONCURRENCYPOLICY_KEY',
      enabledByDefault: true,
      documentationUrl: 'https://hub.datree.io/prevent-cronjob-concurrency',
      messageOnFailure:
        "Missing property object `concurrencyPolicy` - the behavior will be more deterministic if jobs won't run concurrently",
      category: 'CronJob',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['CronJob'],
            },
          },
        },
        then: {
          properties: {
            spec: {
              properties: {
                concurrencyPolicy: {
                  enum: ['Forbid', 'Replace'],
                },
              },
              required: ['concurrencyPolicy'],
            },
          },
        },
      },
    },
    {
      id: 25,
      name: 'Prevent deploying naked pods',
      uniqueName: 'K8S_INCORRECT_KIND_VALUE_POD',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-naked-pods',
      messageOnFailure:
        "Incorrect value for key `kind` - raw pod won't be rescheduled in the event of a node failure",
      category: 'Other',
      schema: {
        properties: {
          kind: {
            type: 'string',
            not: {
              enum: ['Pod'],
            },
          },
        },
      },
    },
    {
      id: 26,
      name: "Prevent containers from sharing the host's PID namespace",
      uniqueName: 'CONTAINERS_INCORRECT_HOSTPID_VALUE_TRUE',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-using-host-pid',
      messageOnFailure:
        "Incorrect value for key `hostPID` - running on the host's PID namespace enables access to sensitive information from processes running outside the container",
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    hostPID: {
                      not: {
                        enum: [true, 'true'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 27,
      name: 'Prevent containers from sharing the host`s IPC namespace',
      uniqueName: 'CONTAINERS_INCORRECT_HOSTIPC_VALUE_TRUE',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-using-host-ipc',
      messageOnFailure:
        'Incorrect value for key `hostIPC` - running on the host`s IPC namespace can be (maliciously) used to interact with other processes running outside the container',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    hostIPC: {
                      not: {
                        enum: [true, 'true'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 28,
      name: "Prevent containers from sharing the host's network namespace",
      uniqueName: 'CONTAINERS_INCORRECT_HOSTNETWORK_VALUE_TRUE',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-using-host-network',
      messageOnFailure:
        "Incorrect value for key `hostNetwork` - running on the host's network namespace can allow a compromised container to sniff network traffic",
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    hostNetwork: {
                      not: {
                        enum: [true, 'true'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 29,
      name: 'Prevent containers from accessing host files by using high UIDs',
      uniqueName: 'CONTAINERS_INCORRECT_RUNASUSER_VALUE_LOWUID',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-uid-conflicts',
      messageOnFailure:
        'Incorrect value for key `runAsUser` - value should be above 9999 to reduce the likelihood that the UID is already taken',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          securityContext: {
                            properties: {
                              runAsUser: {
                                minimum: 10000,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 30,
      name: 'Prevent containers from mounting Docker socket',
      uniqueName: 'CONTAINERS_INCORRECT_PATH_VALUE_DOCKERSOCKET',
      enabledByDefault: false,
      documentationUrl: 'https://hub.datree.io/prevent-mounting-docker-socket',
      messageOnFailure:
        'Incorrect value for key `path` - avoid mounting the docker.socket becasue it can allow container breakout',
      category: 'Containers',
      schema: {
        definitions: {
          specContainers: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    containers: {
                      type: 'array',
                      items: {
                        properties: {
                          volumeMounts: {
                            type: 'array',
                            items: {
                              properties: {
                                mountPath: {
                                  not: {
                                    enum: ['/var/run/docker.sock'],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          specVolumes: {
            if: {
              properties: {
                kind: {
                  enum: [
                    'Deployment',
                    'Pod',
                    'DaemonSet',
                    'StatefulSet',
                    'ReplicaSet',
                    'CronJob',
                    'Job',
                  ],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    volumes: {
                      type: 'array',
                      items: {
                        properties: {
                          hostPath: {
                            properties: {
                              path: {
                                not: {
                                  enum: ['/var/run/docker.sock'],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainers',
          },
          {
            $ref: '#/definitions/specVolumes',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 31,
      name: 'Prevent ConfigMap security vulnerability (CVE-2021-25742)',
      uniqueName: 'CONFIGMAP_CVE2021_25742_INCORRECT_SNIPPET_ANNOTATIONS_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-configmap-security-vulnerability-cve-2021-25742',
      messageOnFailure:
        'Missing property object `allow-snippet-annotations` - set it to "false" to override default behaviour',
      category: 'Security',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['ConfigMap'],
            },
          },
        },
        then: {
          properties: {
            data: {
              properties: {
                'allow-snippet-annotations': {
                  enum: ['false'],
                },
              },
              required: ['allow-snippet-annotations'],
            },
          },
        },
      },
    },
    {
      id: 32,
      name: 'Prevent Ingress security vulnerability (CVE-2021-25742)',
      uniqueName: 'INGRESS_CVE2021_25742_INCORRECT_SERVER_SNIPPET_KEY',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-ingress-security-vulnerability-cve-2021-25742',
      messageOnFailure:
        'Forbidden property object `server-snippet` - ingress-nginx custom snippets are not allowed',
      category: 'Security',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Ingress'],
            },
          },
        },
        then: {
          properties: {
            metadata: {
              properties: {
                annotations: {
                  not: {
                    propertyNames: {
                      pattern: '^.*server-snippet$',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 33,
      name: 'Prevent container security vulnerability (CVE-2021-25741)',
      uniqueName: 'CONTAINER_CVE2021_25741_INCORRECT_SUBPATH_KEY',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-container-security-vulnerability-cve-2021-25741',
      messageOnFailure:
        'Forbidden property object `subPath` - malicious users can gain access to files & directories outside of the volume',
      category: 'Security',
      schema: {
        definitions: {
          subPathPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        volumeMounts: {
                          type: 'array',
                          items: {
                            propertyNames: {
                              not: {
                                pattern: '^subPath$',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/subPathPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 34,
      name: 'Prevent EndpointSlice security vulnerability (CVE-2021-25737)',
      uniqueName: 'ENDPOINTSLICE_CVE2021_25373_INCORRECT_ADDRESSES_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-endpointslice-validation-from-enabling-host-network-hijack-cve-2021-25737',
      messageOnFailure:
        'Incorrect value for key `addresses` - IP address is within vulnerable ranges (127.0.0.0/8 and 169.254.0.0/16)',
      category: 'Security',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['EndpointSlice'],
            },
          },
        },
        then: {
          properties: {
            endpoints: {
              type: 'array',
              items: {
                properties: {
                  addresses: {
                    type: 'array',
                    items: {
                      not: {
                        anyOf: [
                          {
                            pattern: '^(169\\.254\\.)',
                          },
                          {
                            pattern: '^(127\\.)',
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 45,
      name: 'Ensure each container has a read-only root filesystem',
      uniqueName: 'CONTAINERS_INCORRECT_READONLYROOTFILESYSTEM_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/ensure-read-only-filesystem',
      messageOnFailure:
        "Incorrect value for key `readOnlyRootFilesystem` - set to 'true' to protect filesystem from potential attacks",
      category: 'NSA',
      schema: {
        definitions: {
          containerSecurityPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        securityContext: {
                          properties: {
                            readOnlyRootFilesystem: {
                              const: true,
                            },
                          },
                          required: ['readOnlyRootFilesystem'],
                        },
                      },
                      required: ['securityContext'],
                    },
                  },
                },
              },
            },
          },
          podSecurityContextPattern: {
            if: {
              properties: {
                kind: {
                  enum: ['Pod'],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    securityContext: {
                      properties: {
                        readOnlyRootFilesystem: {
                          const: true,
                        },
                      },
                      required: ['readOnlyRootFilesystem'],
                    },
                  },
                  required: ['securityContext'],
                },
              },
            },
          },
        },
        anyOf: [
          {
            $ref: '#/definitions/containerSecurityPattern',
          },
          {
            $ref: '#/definitions/podSecurityContextPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 46,
      name: 'Prevent containers from accessing underlying host',
      uniqueName: 'CONTAINERS_INCORRECT_KEY_HOSTPATH',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-accessing-underlying-host',
      messageOnFailure:
        'Invalid key `hostPath` - refrain from using this mount to prevent an attack on the underlying host',
      category: 'NSA',
      schema: {
        definitions: {
          specVolumePattern: {
            properties: {
              spec: {
                properties: {
                  volumes: {
                    type: 'array',
                    items: {
                      not: {
                        required: ['hostPath'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specVolumePattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 47,
      name: 'Prevent containers from escalating privileges',
      uniqueName: 'CONTAINERS_MISSING_KEY_ALLOWPRIVILEGEESCALATION',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-escalating-privileges',
      messageOnFailure:
        'Missing key `allowPrivilegeEscalation` - set to false to prevent attackers from exploiting escalated container privileges',
      category: 'NSA',
      schema: {
        definitions: {
          specContainerPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        securityContext: {
                          properties: {
                            allowPrivilegeEscalation: {
                              const: false,
                            },
                          },
                          required: ['allowPrivilegeEscalation'],
                        },
                      },
                      required: ['securityContext'],
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainerPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 48,
      name: 'Prevent containers from allowing command execution',
      uniqueName: 'CONTAINERS_INCORRECT_RESOURCES_VERBS_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-allowing-command-execution',
      messageOnFailure:
        'Incorrect value for key `resources` and/or `verbs` - allowing containers to run the exec command can be exploited by attackers',
      category: 'NSA',
      schema: {
        if: {
          properties: {
            kind: {
              enum: ['Role', 'ClusterRole'],
            },
          },
        },
        then: {
          properties: {
            rules: {
              type: 'array',
              items: {
                properties: {
                  resources: {
                    type: 'array',
                    not: {
                      items: {
                        enum: ['*', 'pods/exec'],
                      },
                    },
                  },
                  verbs: {
                    type: 'array',
                    not: {
                      items: {
                        enum: ['create', '*'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 49,
      name: 'Prevent containers from having insecure capabilities',
      uniqueName: 'CONTAINERS_INVALID_CAPABILITIES_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-insecure-capabilities',
      messageOnFailure:
        'Incorrect value for key `add` - refrain from using insecure capabilities to prevent access to sensitive components',
      category: 'NSA',
      schema: {
        definitions: {
          specContainerPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        securityContext: {
                          properties: {
                            capabilities: {
                              properties: {
                                add: {
                                  type: 'array',
                                  items: {
                                    not: {
                                      enum: [
                                        'SETPCAP',
                                        'NET_ADMIN',
                                        'NET_RAW',
                                        'SYS_MODULE',
                                        'SYS_RAWIO',
                                        'SYS_PTRACE',
                                        'SYS_ADMIN',
                                        'SYS_BOOT',
                                        'MAC_OVERRIDE',
                                        'MAC_ADMIN',
                                        'PERFMON',
                                        'ALL',
                                        'BPF',
                                      ],
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainerPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 50,
      name: 'Prevent containers from insecurely exposing workload',
      uniqueName: 'CONTAINERS_INCORRECT_KEY_HOSTPORT',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-insecurely-exposing-workload',
      messageOnFailure:
        'Incorrect key `hostPort` - refrain from using this key to prevent insecurely exposing your workload',
      category: 'NSA',
      schema: {
        definitions: {
          specContainerPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        ports: {
                          type: 'array',
                          items: {
                            not: {
                              required: ['hostPort'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainerPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 51,
      name: 'Prevent containers from accessing host files by using high GIDs',
      uniqueName: 'CONTAINERS_INCORRECT_RUNASGROUP_VALUE_LOWGID',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-accessing-host-files-by-using-high-gids',
      messageOnFailure:
        'Invalid value for key `runAsGroup` - must be greater than 999 to ensure container is running with non-root group membership',
      category: 'NSA',
      schema: {
        definitions: {
          specContainerPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        securityContext: {
                          properties: {
                            runAsGroup: {
                              minimum: 1000,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          podSecurityContextPattern: {
            if: {
              properties: {
                kind: {
                  enum: ['Pod'],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    securityContext: {
                      properties: {
                        runAsGroup: {
                          minimum: 1000,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/specContainerPattern',
          },
          {
            $ref: '#/definitions/podSecurityContextPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 52,
      name: 'Prevent container from running with root privileges',
      uniqueName: 'CONTAINERS_INCORRECT_RUNASNONROOT_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-running-with-root-privileges',
      messageOnFailure:
        'Invalid value for key `runAsNonRoot` - must be set to `true` to prevent unnecessary privileges',
      category: 'NSA',
      schema: {
        definitions: {
          containerSecurityPattern: {
            properties: {
              spec: {
                properties: {
                  containers: {
                    type: 'array',
                    items: {
                      properties: {
                        securityContext: {
                          properties: {
                            runAsNonRoot: {
                              const: true,
                            },
                          },
                          required: ['runAsNonRoot'],
                        },
                      },
                      required: ['securityContext'],
                    },
                  },
                },
              },
            },
          },
          podSecurityContextPattern: {
            if: {
              properties: {
                kind: {
                  enum: ['Pod'],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    securityContext: {
                      properties: {
                        runAsNonRoot: {
                          const: true,
                        },
                      },
                      required: ['runAsNonRoot'],
                    },
                  },
                },
              },
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/containerSecurityPattern',
          },
          {
            $ref: '#/definitions/podSecurityContextPattern',
          },
        ],
        additionalProperties: {
          $ref: '#',
        },
        items: {
          $ref: '#',
        },
      },
    },
    {
      id: 53,
      name: 'Prevent service account token auto-mounting on pods',
      uniqueName: 'SRVACC_INCORRECT_AUTOMOUNTSERVICEACCOUNTTOKEN_VALUE',
      enabledByDefault: false,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/prevent-service-account-token-auto-mount',
      messageOnFailure:
        'Invalid value for key `automountServiceAccountToken` - must be set to `false` to prevent granting unnecessary access to the service account',
      category: 'NSA',
      schema: {
        definitions: {
          podPattern: {
            if: {
              properties: {
                kind: {
                  enum: ['Pod'],
                },
              },
            },
            then: {
              properties: {
                spec: {
                  properties: {
                    automountServiceAccountToken: {
                      const: false,
                    },
                  },
                  required: ['automountServiceAccountToken'],
                },
              },
            },
          },
          serviceAccountPattern: {
            if: {
              properties: {
                kind: {
                  enum: ['ServiceAccount'],
                },
              },
            },
            then: {
              properties: {
                automountServiceAccountToken: {
                  const: false,
                },
              },
              required: ['automountServiceAccountToken'],
            },
          },
        },
        allOf: [
          {
            $ref: '#/definitions/podPattern',
          },
          {
            $ref: '#/definitions/serviceAccountPattern',
          },
        ],
      },
    },
    {
      id: 54,
      name: 'Ensure resource has a configured name',
      uniqueName: 'RESOURCE_MISSING_NAME',
      enabledByDefault: true,
      documentationUrl:
        'https://hub.datree.io/built-in-rules/ensure-resource-name',
      messageOnFailure:
        'Missing key `name` or `generateName` - one of them must be set to apply resource to a cluster',
      category: 'Other',
      schema: {
        definitions: {
          metadataNamePattern: {
            properties: {
              metadata: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                },
                required: ['name'],
              },
            },
            required: ['metadata'],
          },
          metadataGenerateNamePattern: {
            properties: {
              metadata: {
                type: 'object',
                properties: {
                  generateName: {
                    type: 'string',
                  },
                },
                required: ['generateName'],
              },
            },
            required: ['metadata'],
          },
        },
        anyOf: [
          {
            $ref: '#/definitions/metadataNamePattern',
          },
          {
            $ref: '#/definitions/metadataGenerateNamePattern',
          },
        ],
      },
    },
  ],
};
