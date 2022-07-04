import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

import { AuthorizationPolicyCreate } from './AuthorizationPolicyCreate';

export function AuthorizationPolicyList(props) {
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
      createResourceForm={AuthorizationPolicyCreate}
      {...props}
    />
  );
}
export default AuthorizationPolicyList;
