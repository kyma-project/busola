import React from 'react';

import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

export function DaemonSetStatus({ daemonSet }) {
  const running = daemonSet.status.numberReady || 0;
  const expected =
    daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);

  return <RunningPodsStatus running={running} expected={expected} />;
}
