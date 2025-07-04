import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../hooks';

export const resolveType = (status: string) => {
  if (typeof status !== 'string') {
    return 'None';
  }

  switch (status) {
    case 'Initial':
    case 'Pending':
    case 'Available':
    case 'Released':
      return 'Information';
    case 'Ready':
    case 'Bound':
    case 'Running':
    case 'Success':
    case 'Succeeded':
    case 'Ok':
      return 'Positive';
    case 'Processing':
    case 'Deleting':
    case 'Unknown':
    case 'Unmanaged':
      return 'None';
    case 'Warning':
      return 'Critical';
    case 'Failed':
    case 'Error':
    case 'Failure':
    case 'Invalid':
      return 'Negative';
    default:
      return 'None';
  }
};

export const ModuleStatus = ({ resource }: any) => {
  const { data: status } = useModuleStatus(resource?.resource);

  const moduleState = status?.state || 'Unknown';
  const moduleMessage = status?.description;

  return (
    <StatusBadge
      resourceKind="kymas"
      type={resolveType(moduleState)}
      tooltipContent={moduleMessage}
    >
      {moduleState}
    </StatusBadge>
  );
};
