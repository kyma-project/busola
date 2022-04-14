import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

import { Trans } from 'react-i18next';
import { RolesCreate } from '../Create/Roles/Roles.create';

export function GenericRolesList({ descriptionKey, ...otherParams }) {
  const description = (
    <Trans i18nKey={descriptionKey}>
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization"
      />
    </Trans>
  );

  return <ResourcesList description={description} {...otherParams} />;
}

function RolesList(props) {
  return (
    <GenericRolesList
      descriptionKey={'roles.description'}
      {...props}
      createResourceForm={RolesCreate}
    />
  );
}

export default RolesList;
