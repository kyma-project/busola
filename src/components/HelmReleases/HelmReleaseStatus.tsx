import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';

export function HelmReleaseStatus({ status }: { status?: string }) {
  const resolveType = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'deployed':
        return 'Positive';
      case 'uninstalling':
      case 'failed':
        return 'Negative';
      case 'unknown':
        return 'None';
      default:
        return 'Information';
    }
  };

  return (
    <StatusBadge resourceKind="helm-releases" type={resolveType(status)}>
      {toSentenceCase(status)}
    </StatusBadge>
  );
}
