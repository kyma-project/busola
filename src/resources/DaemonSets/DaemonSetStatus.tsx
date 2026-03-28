import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

export type DaemonSetType = {
  status: {
    numberReady: number;
    numberUnavailable: number;
  };
};

export function DaemonSetStatus({ daemonSet }: { daemonSet: DaemonSetType }) {
  const running = daemonSet.status.numberReady || 0;
  const expected =
    daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);

  return <RunningPodsStatus running={running} expected={expected} />;
}
