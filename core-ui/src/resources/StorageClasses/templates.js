export function createStorageClassTemplate() {
  return {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClass',
    metadata: {
      name: '',
    },
    provisioner: '',
    parameters: {
      type: '',
    },
    reclaimPolicy: '',
  };
}
