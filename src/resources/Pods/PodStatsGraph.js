import React from 'react';

import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';

export function PodStatsGraph(resource) {
  return (
    <StatsPanel
      type="pod"
      mode="multiple"
      namespace={resource.metadata.namespace}
      pod={resource.metadata.name}
    />
  );
}
