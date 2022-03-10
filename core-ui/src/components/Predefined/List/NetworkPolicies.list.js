import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const NetworkPoliciesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const description = (
    <Trans i18nKey="network-policies.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('network-policies.title')}
      description={description}
      {...otherParams}
    />
  );
};
