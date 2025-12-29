import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';

export function NamespaceStatus({ namespaceStatus }) {
  const badgeType = (status) => {
    switch (status) {
      case 'Active':
        return 'Positive';
      case 'Terminating':
        return 'Information';
      default:
        return 'Negative';
    }
  };

  return (
    <StatusBadge
      resourceKind="namespaces"
      type={badgeType(namespaceStatus.phase)}
    >
      {toSentenceCase(namespaceStatus.phase)}
    </StatusBadge>
  );
}
