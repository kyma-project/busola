import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

export function StatefulSetPods({
  set,
}: {
  set: { status: { currentReplicas: number }; spec: { replicas: number } };
}) {
  const running = set.status.currentReplicas || 0;
  const expected = set.spec.replicas || 0;

  return <RunningPodsStatus running={running} expected={expected} />;
}
