import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';
import { AuthorizationPoliciesCreate } from '../Create/AuthorizationPolicies/AuthorizationPolicies.create';

const AuthorizationPoliciesList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('authorization-policies.headers.action'),
      value: policy => policy.spec?.action || 'ALLOW',
    },
  ];

  const description = (
    <Trans i18nKey="authorization-policies.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/security/authorization-policy/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      description={description}
      customColumns={customColumns}
      createResourceForm={AuthorizationPoliciesCreate}
      {...props}
    />
  );
};
export default AuthorizationPoliciesList;
