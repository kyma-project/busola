import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const ServiceAccountsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          automount={value.automountServiceAccountToken}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="service-accounts.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      resourceName={t('service-accounts.title')}
      {...otherParams}
    />
  );
};
