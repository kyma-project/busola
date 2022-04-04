import React from 'react';

import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';

export function PodStatsGraph(resource) {
  return (
    <StatsPanel
      type="pod"
      namespace={resource.metadata.namespace}
      pod={resource.metadata.name}
    />
  );
}
