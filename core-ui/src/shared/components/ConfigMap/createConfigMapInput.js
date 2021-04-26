export function createConfigMapInput(name, namespace, labels, data) {
  return {
    metadata: {
      name,
      namespace,
      labels,
    },
    data,
  };
}
