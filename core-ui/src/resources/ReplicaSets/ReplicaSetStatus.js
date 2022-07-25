import React from 'react';

import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

export function ReplicaSetStatus({ replicaSet }) {
  const running = replicaSet.status.readyReplicas || 0;
  const expected = replicaSet.status.replicas || 0;

  return <RunningPodsStatus running={running} expected={expected} />;
}
