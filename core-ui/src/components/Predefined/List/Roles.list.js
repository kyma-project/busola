import React from 'react';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

function GenericRolesList({
  descriptionKey,
  documentationLink,
  DefaultRenderer,
  ...otherParams
}) {
  const description = (
    <Trans i18nKey={descriptionKey}>
      <Link className="fd-link" url={documentationLink} />
    </Trans>
  );

  return <DefaultRenderer description={description} {...otherParams} />;
}

export function RolesList(props) {
  return (
    <GenericRolesList
      descriptionKey="todo"
      documentationLink="todo"
      {...props}
    />
  );
}

export function ClusterRolesList(props) {
  return (
    <GenericRolesList
      descriptionKey="todo"
      documentationLink="todo"
      {...props}
    />
  );
}
