import React from 'react';
import { ControlledBy } from 'react-shared';
import SecretData from 'shared/components/Secret/SecretData';
import { useTranslation } from 'react-i18next';
import { CertificateData } from './CertificateData';
import { HelmReleaseData } from './HelmReleaseData';

export const SecretsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const Secret = resource => <SecretData key="secret-data" secret={resource} />;

  const customColumns = [
    {
      header: t('secrets.headers.type'),
      value: secret => {
        return secret.type;
      },
    },
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Secret, CertificateData, HelmReleaseData]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
