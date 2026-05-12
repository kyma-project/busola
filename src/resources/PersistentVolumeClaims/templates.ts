export const createPersistentVolumeClaimTemplate = (namespace: string) => {
  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      accessModes: ['ReadWriteOnce'],
      volumeMode: 'Filesystem',
      resources: {
        requests: {
          storage: '2Gi',
        },
      },
      storageClassName: '',
    },
  };
};
