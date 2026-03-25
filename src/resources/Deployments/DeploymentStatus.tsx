import { RunningPodsStatus } from 'shared/components/RunningPodsStatus';

type DeploymentStatusProps = {
  deployment: {
    [key: string]: any;
  };
};

export function DeploymentStatus({ deployment }: DeploymentStatusProps) {
  const running = deployment.status.readyReplicas || 0;
  const expected = deployment.status.replicas || deployment.spec.replicas || 0;

  return <RunningPodsStatus running={running} expected={expected} />;
}
