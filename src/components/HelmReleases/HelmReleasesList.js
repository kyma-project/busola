import { useTranslation } from 'react-i18next';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Labels } from 'shared/components/Labels/Labels';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link } from 'react-router-dom';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { groupBy } from 'lodash';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { ResourceDescription } from 'components/HelmReleases';

function HelmReleasesList() {
  const { t } = useTranslation();
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { namespaceUrl } = useUrl();
  const resourceUrl = entry => {
    const currentUrl = window.location.pathname;
    const urlPrefix = currentUrl.includes('namespaces/-all-/')
      ? currentUrl.substring(0, currentUrl.indexOf('-all-') - 1)
      : '';

    return urlPrefix
      ? `${urlPrefix}/${entry.namespace}/helm-releases/${entry.releaseName}`
      : namespaceUrl(`helm-releases/${entry.releaseName}`);
  };

  const { data, loading, error } = useGetList(
    s => s.type === 'helm.sh/release.v1',
  )(
    namespace === '-all-'
      ? `/api/v1/secrets`
      : `/api/v1/namespaces/${namespace}/secrets`,
  );

  const headerRenderer = () => [
    t('common.headers.name'),
    namespace === '-all-' ? t('common.headers.namespace') : null,
    t('common.headers.labels'),
    t('helm-releases.headers.chart'),
    t('helm-releases.headers.revision'),
    t('helm-releases.headers.chart-version'),
    t('common.headers.status'),
  ];

  const rowRenderer = entry => [
    <Link className="bsl-link" to={resourceUrl(entry)}>
      {entry.releaseName}
    </Link>,
    namespace === '-all-' ? entry.namespace : null,
    <div style={{ maxWidth: '36rem' }}>
      <Labels labels={entry.recentRelease?.labels || {}} shortenLongLabels />
    </div>,
    entry.recentRelease?.chart.metadata.name || t('common.statuses.unknown'),
    entry.revision,
    entry.recentRelease?.chart.metadata.version || t('common.statuses.unknown'),
    <HelmReleaseStatus status={entry.status} />,
  ];

  const entries = Object.entries(
    groupBy(data || [], r => r.metadata.labels.name),
  ).map(([releaseName, releases]) => {
    const recentRelease = findRecentRelease(releases);
    return {
      releaseName,
      recentReleaseName: recentRelease?.metadata.name,
      recentRelease: decodeHelmRelease(recentRelease?.data.release),
      revision: releases.length,
      status: recentRelease?.metadata.labels.status || 'unknown',
      namespace: recentRelease?.metadata.namespace,
    };
  });

  return (
    <>
      <DynamicPageComponent
        title={t('helm-releases.title')}
        description={ResourceDescription}
        content={
          <GenericList
            entries={entries}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            serverDataLoading={loading}
            serverDataError={error}
            allowSlashShortcut
            sortBy={{
              name: (a, b) => a.releaseName.localeCompare(b.releaseName),
            }}
            searchSettings={{
              textSearchProperties: ['recentRelease.chart.metadata.name'],
            }}
            emptyListProps={{
              titleText: `${t('common.labels.no')} ${t(
                'helm-releases.title',
              ).toLocaleLowerCase()}`,
              subtitleText: t('helm-releases.description'),
              url:
                'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces',
              buttonText: t('common.buttons.connect'),
            }}
          />
        }
      />
      <YamlUploadDialog />
    </>
  );
}

export default HelmReleasesList;
