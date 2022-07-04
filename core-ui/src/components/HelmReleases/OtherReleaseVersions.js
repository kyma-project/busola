import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link } from 'fundamental-react';
import { HelmReleaseStatus } from './HelmReleaseStatus';

export function OtherReleaseVersions({ releaseSecret, secrets }) {
  const { t, i18n } = useTranslation();

  secrets = secrets.filter(
    s => s.metadata.name !== releaseSecret.metadata.name,
  );
  secrets = secrets.sort(
    (a, b) => b.metadata.labels.version - a.metadata.labels.version,
  );

  const headerRenderer = () => [
    t('secrets.name_singular'),
    t('common.headers.version'),
    t('common.headers.status'),
  ];

  const rowRenderer = ({ metadata }) => [
    <Link
      onClick={() =>
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(`secrets/details/${metadata.name}`)
      }
    >
      {metadata.name}
    </Link>,
    metadata.labels.version,
    <HelmReleaseStatus status={metadata.labels.status} />,
  ];

  return (
    <GenericList
      title={t('helm-releases.headers.other-release-versions')}
      textSearchProperties={['metadata.name']}
      entries={secrets}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
      pagination={{ autoHide: true }}
    />
  );
}
