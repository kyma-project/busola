import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../support';

export const ModuleStatus = ({ resource }: any) => {
  const { data: status } = useModuleStatus(resource);

  const moduleState = status?.state || 'Unknown';
  const moduleMessage = status?.description;

  return (
    <StatusBadge
      resourceKind="kymas"
      type={
        moduleState === 'Ready'
          ? 'Success'
          : moduleState === 'Processing' || moduleState === 'Deleting'
          ? 'None'
          : moduleState || 'None'
      }
      tooltipContent={moduleMessage}
    >
      {moduleState}
    </StatusBadge>
  );
};
