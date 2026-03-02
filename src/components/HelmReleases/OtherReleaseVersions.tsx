import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { Link } from 'shared/components/Link/Link';

type Secret = {
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
    appVersion?: string;
    labels?: { version?: any; status?: string };
  };
};

export function OtherReleaseVersions({
  releaseSecret,
  secrets,
}: {
  secrets?: Secret[] | null;
  releaseSecret?: Secret;
}) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  secrets = secrets?.filter(
    (s) => s?.metadata?.name !== releaseSecret?.metadata?.name,
  );
  secrets = secrets?.sort(
    (a, b) => b?.metadata?.labels?.version - a?.metadata?.labels?.version,
  );

  const headerRenderer = () => [
    t('secrets.name_singular'),
    t('common.headers.version'),
    t('common.headers.status'),
  ];

  const rowRenderer = ({ metadata }: Secret) => [
    <Link key={metadata?.name} url={namespaceUrl(`secrets/${metadata?.name}`)}>
      {metadata?.name}
    </Link>,
    metadata?.labels?.version,
    <HelmReleaseStatus
      key={metadata?.labels?.status}
      status={metadata?.labels?.status}
    />,
  ];

  return (
    <GenericList
      title={t('helm-releases.headers.other-release-versions')}
      entries={secrets as any}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      pagination={{ autoHide: true }}
      searchSettings={
        {
          textSearchProperties: ['metadata.name'],
        } as any
      }
    />
  );
}
