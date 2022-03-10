import React from 'react';
import { Link, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';

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

export function RolesList(props) {
  return <GenericRolesList descriptionKey={'roles.description'} {...props} />;
}
