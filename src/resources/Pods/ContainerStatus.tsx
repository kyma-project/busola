import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';

interface ContainerStatusProps {
  status: Record<string, any>;
}
export function ContainerStatus({ status }: ContainerStatusProps) {
  const state =
    status?.state?.running ||
    status?.state?.waiting ||
    status?.state?.terminated;

  const containerStatus =
    state?.reason || Object.keys(status?.state || {})?.[0] || 'Unknown';
  const message = state?.message || null;

  const badgeType = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'completed':
      case 'succeeded':
        return 'Positive';
      case 'containercreating':
      case 'initing':
      case 'pending':
      case 'podinitializing':
      case 'terminating':
        return 'Information';
      case 'unknown':
        return 'None';
      default:
        return 'Negative';
    }
  };

  return (
    <div>
      <StatusBadge
        resourceKind="containers"
        additionalContent={message}
        type={badgeType(containerStatus)}
      >
        {toSentenceCase(containerStatus)}
      </StatusBadge>
    </div>
  );
}
