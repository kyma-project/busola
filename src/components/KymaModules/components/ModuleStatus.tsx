import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../support';

export const ModuleStatus = ({ resource }: any) => {
  const { data: moduleStatus } = useModuleStatus(resource);

  const moduleState = moduleStatus?.state || 'Unknown';
  const moduleMessage = moduleStatus?.description;

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {moduleState && (
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
      )}
    </div>
  );
};
