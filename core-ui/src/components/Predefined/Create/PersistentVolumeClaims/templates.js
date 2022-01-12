export const createPersistentVolumeClaimsTemplate = namespace => {
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
          storage: '1Gi',
        },
      },
      storageClassName: '',
    },
  };
};
