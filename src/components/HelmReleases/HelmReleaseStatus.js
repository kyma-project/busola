import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function HelmReleaseStatus({ status }) {
  const resolveType = (status) => {
    switch (status) {
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
      {status}
    </StatusBadge>
  );
}
