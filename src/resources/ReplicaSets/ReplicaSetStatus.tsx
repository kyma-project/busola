import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

interface ReplicaSetStatusProps {
  replicaSet: any;
}

export function ReplicaSetStatus({ replicaSet }: ReplicaSetStatusProps) {
  const running = replicaSet.status.readyReplicas || 0;
  const expected = replicaSet.status.replicas || replicaSet.spec.replicas || 0;

  return <RunningPodsStatus running={running} expected={expected} />;
}
