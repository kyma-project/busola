import React from 'react';
import { ControlledBy } from 'react-shared';
import SecretData from 'shared/components/Secret/SecretData';
import { useTranslation } from 'react-i18next';
import { CertificateData } from './CertificateData';
import { HelmReleaseData } from 'components/HelmReleases/HelmReleaseData';

import './SecretsDetails.scss';

function HelmReleaseDataWrapper(secret) {
  if (secret.type !== 'helm.sh/release.v1') {
    return null;
  }

  return (
    <HelmReleaseData
      key="helm-release-data"
      encodedRelease={secret.data.release}
    />
  );
}

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
      customComponents={[Secret, CertificateData, HelmReleaseDataWrapper]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
