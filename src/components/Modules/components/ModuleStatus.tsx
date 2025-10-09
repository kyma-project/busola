import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useModuleStatus } from '../hooks';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';

export const resolveType = (status: string): ValueState => {
  switch (status) {
    case 'Initial':
    case 'Pending':
      return ValueState.Information;
    case 'Available':
    case 'Ready':
    case 'Bound':
    case 'Running':
    case 'Success':
    case 'Succeeded':
    case 'Progressing':
    case 'Ok':
      return ValueState.Positive;
    case 'Processing':
    case 'Deleting':
    case 'Unknown':
    case 'Unmanaged':
      return ValueState.None;
    case 'Warning':
      return ValueState.Critical;
    case 'Failed':
    case 'Error':
    case 'Failure':
    case 'Invalid':
      return ValueState.Negative;
    case 'Uploading': //Those statuses are doesn't exist in Modules. Statuses created for Community Modules Upload
    case 'Downloading':
    case 'Released':
      return ValueState.Information;
    case 'Finished':
      return ValueState.Positive;

    default:
      return ValueState.None;
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
