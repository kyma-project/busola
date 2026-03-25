import { ReactNode } from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

interface GenericRoleListProps {
  description: ReactNode;
  descriptionKey: string;
  [key: string]: any;
}

export function GenericRoleList({
  description,
  descriptionKey,
  ...otherParams
}: GenericRoleListProps) {
  return (
    <ResourcesList
      description={description}
      {...(otherParams as any)}
      emptyListProps={{
        subtitleText: descriptionKey,
        url: 'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization',
      }}
    />
  );
}
