import React from 'react';

import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

export function DeploymentStatus({ deployment }) {
  const running = deployment.status.readyReplicas || 0;
  const expected = deployment.status.replicas || 0;

  return <RunningPodsStatus running={running} expected={expected} />;
}
