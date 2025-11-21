type Node = {
  status: {
    allocatable: any;
  };
};

export function getAvailableNvidiaGPUs(nodesData: Node[]): number {
  if (!nodesData) {
    return 0;
  }
  return nodesData
    .map((node) => node.status.allocatable)
    .reduce((partialSum, item) => {
      const nvidiaGpus = item['nvidia.com/gpu'];
      if (nvidiaGpus) {
        const value = parseInt(nvidiaGpus);
        return partialSum + value;
      }
      return partialSum;
    }, 0);
}
