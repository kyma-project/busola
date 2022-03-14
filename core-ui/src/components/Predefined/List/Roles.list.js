import React from 'react';
import { Link } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

function GenericRolesList({ descriptionKey, DefaultRenderer, ...otherParams }) {
  const description = (
    <Trans i18nKey={descriptionKey}>
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization"
      />
    </Trans>
  );

  return <DefaultRenderer description={description} {...otherParams} />;
}

export function RolesList(props) {
  const { t } = useTranslation();

  return (
    <GenericRolesList
      resourceName={t('roles.title')}
      descriptionKey={'roles.description'}
      {...props}
    />
  );
}

export function ClusterRolesList(props) {
  const { t } = useTranslation();

  return (
    <GenericRolesList
      resourceName={t('cluster-roles.title')}
      descriptionKey={'cluster-roles.description'}
      {...props}
    />
  );
}
