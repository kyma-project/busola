import { Fragment, ReactNode } from 'react';
import { ResourceStatusCard } from '../ResourceStatusCard/ResourceStatusCard';
import {
  CustomColumn,
  CustomColumnsType,
  ResourceCustomStatusColumns,
} from './ResourceCustomStatusColumns';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';

type ResourceStatusCardContentProps = {
  resource: K8sResource & Resource;
  statusBadge?: (resource: any) => ReactNode;
  customStatus?: ReactNode;
  customStatusColumns?: CustomColumnsType;
  filteredStatusColumns: CustomColumn[];
  filteredStatusColumnsLong: CustomColumn[];
  statusConditions?: (resource: any) => {
    type: string;
    status: string;
    reason?: string;
    message?: string;
  }[];
  customConditionsComponents?: CustomColumnsType;
  filteredConditionsComponents?: CustomColumn[];
};

export const ResourceStatusCardContent = ({
  resource,
  statusBadge,
  customStatus,
  customStatusColumns,
  filteredStatusColumns,
  filteredStatusColumnsLong,
  statusConditions,
  customConditionsComponents,
  filteredConditionsComponents,
}: ResourceStatusCardContentProps) => {
  return customStatus ? (
    customStatus
  ) : customStatusColumns?.length ||
    customConditionsComponents?.length ||
    statusConditions?.length ? (
    <ResourceStatusCard
      statusBadge={statusBadge ? statusBadge(resource) : null}
      customColumns={
        customStatusColumns?.length ? (
          <ResourceCustomStatusColumns
            filteredStatusColumns={filteredStatusColumns}
            resource={resource}
          />
        ) : null
      }
      customColumnsLong={
        customStatusColumns?.length ? (
          <ResourceCustomStatusColumns
            filteredStatusColumns={filteredStatusColumnsLong}
            resource={resource}
          />
        ) : null
      }
      conditions={statusConditions ? statusConditions(resource) : null}
      customConditionsComponent={
        customConditionsComponents?.length ? (
          <>
            {filteredConditionsComponents?.map((component, index) => (
              <Fragment
                key={`${component?.header?.replace(' ', '-')}-${index}`}
              >
                <div className="title bsl-has-color-status-4 sap-margin-x-small">
                  {component.header}:
                </div>
                {component.value(resource)}
              </Fragment>
            ))}
          </>
        ) : null
      }
    />
  ) : null;
};
