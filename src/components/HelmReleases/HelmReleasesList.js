import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import { ResourceDescription, docsURL } from 'components/HelmReleases';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { HelmReleaseStatus } from './HelmReleaseStatus';

function HelmReleasesList() {
  const { t } = useTranslation();
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { namespaceUrl } = useUrl();
  const resourceUrl = entry => {
    return namespaceUrl(`helm-releases/${entry.releaseName}`, {
      namespace: entry.namespace,
    });
  };

  const dataUrl =
    namespace === '-all-'
      ? `/api/v1/secrets`
      : `/api/v1/namespaces/${namespace}/secrets`;

  const { data, loading, error } = useGetList(
    s => s.type === 'helm.sh/release.v1',
  )(dataUrl);

  const entries = Object.entries(
    groupBy(data || [], r => r.metadata.labels.name),
  ).map(([releaseName, releases]) => {
    const recentRelease = findRecentRelease(releases);
    recentRelease.metadata.name = releaseName;
    return {
      name: releaseName,
      releaseName,
      recentReleaseName: recentRelease?.metadata.name,
      recentRelease: decodeHelmRelease(recentRelease?.data.release),
      revision: releases.length,
      status: recentRelease?.metadata.labels.status || 'unknown',
      namespace: recentRelease?.metadata.namespace,
      ...recentRelease,
    };
  });

  const customColumns = [
    {
      header: t('helm-releases.headers.chart'),
      value: entry =>
        entry.recentRelease?.chart.metadata.name ||
        t('common.statuses.unknown'),
    },
    {
      header: t('helm-releases.headers.revision'),
      value: entry => entry.revision,
    },
    {
      header: t('helm-releases.headers.chart-version'),
      value: entry =>
        entry.recentRelease?.chart.metadata.version ||
        t('common.statuses.unknown'),
    },
    {
      header: t('common.headers.status'),
      value: entry => (
        <HelmReleaseStatus status={entry.metadata.labels.status} />
      ),
    },
  ];

  return (
    <>
      <ResourcesList
        resources={entries}
        customColumns={customColumns}
        serverDataLoading={loading}
        serverDataError={error}
        allowSlashShortcut
        hasDetailsView
        enableColumnLayout
        customUrl={resourceUrl}
        resourceUrl={dataUrl}
        resourceType="HelmReleases"
        sortBy={{
          name: (a, b) => a.releaseName.localeCompare(b.releaseName),
        }}
        searchSettings={{
          textSearchProperties: [
            'recentRelease.chart.metadata.name',
            'releaseName',
          ],
        }}
        emptyListProps={{
          subtitleText: ResourceDescription,
          url: docsURL,
          showButton: false,
        }}
        readOnly
        description={ResourceDescription}
      />
    </>
  );
}

export default HelmReleasesList;
