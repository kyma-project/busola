import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const AuthorizationPoliciesList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const getAction = policy => {
    if (policy.spec?.action) return policy.spec?.action;
    else return 'ALLOW';
  };

  const customColumns = [
    {
      header: t('authorizationpolicies.headers.action'),
      value: getAction,
    },
  ];

  const description = (
    <Trans i18nKey="authorizationpolicies.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/security/authorization-policy/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
