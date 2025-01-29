import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function PersistentVolumeStatus({ status }) {
  const badgeType = status => {
    switch (status) {
      case 'Bound':
      case 'Available':
        return 'Positive';
      case 'Released':
      case 'Pending':
        return 'Information';
      default:
        return 'Negative';
    }
  };

  return (
    <StatusBadge
      resourceKind="pv"
      type={badgeType(status?.phase)}
      additionalContent={status?.message}
    >
      {status?.phase}
    </StatusBadge>
  );
}
