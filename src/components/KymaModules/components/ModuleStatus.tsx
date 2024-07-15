import { PopoverBadge } from 'shared/components/PopoverBadge/PopoverBadge';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../support';

export const ModuleStatus = ({ moduleStatus, resource }: any) => {
  const { data: status, loading, error } = useModuleStatus(resource);
  const moduleState =
    loading || error
      ? moduleStatus?.state || 'Unknown'
      : status?.state || moduleStatus?.state || 'Unknown';
  const message = status?.description || moduleStatus?.message;

  return message ? (
    <PopoverBadge
      type={
        moduleState === 'Ready'
          ? 'Success'
          : moduleState === 'Processing' || moduleState === 'Deleting'
          ? 'None'
          : moduleState || 'None'
      }
      tooltipContent={message}
    >
      {moduleState}
    </PopoverBadge>
  ) : (
    <StatusBadge
      resourceKind="kymas"
      type={
        moduleState === 'Ready'
          ? 'Success'
          : moduleState === 'Processing' || moduleState === 'Deleting'
          ? 'None'
          : moduleState || 'None'
      }
    >
      {moduleState}
    </StatusBadge>
  );
};
