import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../support';

export const ModuleStatus = ({ resource }: any) => {
  const { data: status } = useModuleStatus(resource);

  const moduleState = status?.state || 'Unknown';
  const moduleMessage = status?.description;

  const resolveType = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'Positive';
      case 'Processing':
      case 'Deleting':
      case 'Unknown':
        return 'None';
      case 'Warning':
        return 'Critical';
      case 'Error':
        return 'Negative';
      default:
        return 'None';
    }
  };

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
