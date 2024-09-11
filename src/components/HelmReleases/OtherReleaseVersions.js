import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { Link } from 'shared/components/Link/Link';

export function OtherReleaseVersions({ releaseSecret, secrets }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

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
    <Link url={namespaceUrl(`secrets/${metadata.name}`)}>{metadata.name}</Link>,
    metadata.labels.version,
    <HelmReleaseStatus status={metadata.labels.status} />,
  ];

  return (
    <GenericList
      title={t('helm-releases.headers.other-release-versions')}
      entries={secrets}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      pagination={{ autoHide: true }}
      searchSettings={{
        textSearchProperties: ['metadata.name'],
      }}
    />
  );
}
