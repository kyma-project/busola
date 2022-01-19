export function createPersistentVolumeTemplate() {
  return {
    apiVersion: 'v1',
    kind: 'PersistentVolume',
    metadata: {
      name: '',
    },
    spec: {
      capacity: {
        storage: '5Gi',
      },
      volumeMode: 'Filesystem',
      accessModes: ['ReadWriteOnce'],
      nfs: {
        path: '',
        server: '',
      },
    },
  };
}
