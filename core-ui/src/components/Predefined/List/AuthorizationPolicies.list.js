import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const AuthorizationPoliciesList = ({
  DefaultRenderer,
  ...otherParams
}) => {
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
    <DefaultRenderer
      resourceName={t('authorization-policies.title')}
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
