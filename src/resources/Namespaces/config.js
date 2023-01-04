const NS_CONTAINER_LIMITS_PRESET = {
  S: { max: '550Mi', default: '250Mi', defaultRequest: '16Mi' },
  M: { max: '1100Mi', default: '511Mi', defaultRequest: '32Mi' },
  L: { max: '2200Mi', default: '1024Mi', defaultRequest: '64Mi' },
};
const NS_MEMORY_QUOTAS_PRESET = {
  S: {
    limits: '1.5Gi',
    requests: '1.4Gi',
  },
  M: {
    limits: '3Gi',
    requests: '2.8Gi',
  },
  L: {
    limits: '6Gi',
    requests: '5.6Gi',
  },
  XL: {
    limits: '9Gi',
    requests: '8.4Gi',
  },
};

export const CONFIG = {
  NS_CONTAINER_LIMITS_PRESET,
  NS_MEMORY_QUOTAS_PRESET,
};
