import React from 'react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import SecretData from 'shared/components/Secret/SecretData';
import { useTranslation } from 'react-i18next';
import { CertificateData } from './CertificateData';
import { HelmReleaseData } from 'components/HelmReleases/HelmReleaseData';
import { SecretsCreate } from '../../Create/Secrets/Secrets.create';

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

const SecretsDetails = props => {
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
    <ResourceDetails
      customComponents={[Secret, CertificateData, HelmReleaseDataWrapper]}
      customColumns={customColumns}
      createResourceForm={SecretsCreate}
      {...props}
    />
  );
};
export default SecretsDetails;
