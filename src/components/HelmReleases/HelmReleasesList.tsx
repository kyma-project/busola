import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import {
  ResourceDescription,
  docsURL,
  i18nDescriptionKey,
} from 'components/HelmReleases';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';

function HelmReleasesList() {
  const { t } = useTranslation();
  useWindowTitle(t('helm-releases.title'));

  const namespace = useAtomValue(activeNamespaceIdAtom);
  const { namespaceUrl } = useUrl();
  const resourceUrl = (entry: Record<string, any>) => {
    return namespaceUrl(`helm-releases/${entry.releaseName}`, {
      namespace: entry.namespace,
    });
  };
  const dataUrl =
    namespace === '-all-'
      ? `/api/v1/secrets`
      : `/api/v1/namespaces/${namespace}/secrets`;

  const { data, loading, error } = useGetList(
    (s: { type: string }) => s.type === 'helm.sh/release.v1',
  )(dataUrl);

  const entries = Object.entries(
    groupBy(data || [], (r: any) => r.metadata.labels.name),
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
      value: (entry: Record<string, any>) =>
        entry.recentRelease?.chart.metadata.name ||
        t('common.statuses.unknown'),
    },
    {
      header: t('helm-releases.headers.revision'),
      value: (entry: Record<string, any>) => entry.revision,
    },
    {
      header: t('helm-releases.headers.chart-version'),
      value: (entry: Record<string, any>) =>
        entry.recentRelease?.chart.metadata.version ||
        t('common.statuses.unknown'),
    },
    {
      header: t('common.headers.status'),
      value: (entry: Record<string, any>) => (
        <HelmReleaseStatus status={entry.metadata.labels.status} />
      ),
    },
  ];

  return (
    <ResourcesList
      resources={entries}
      customColumns={customColumns}
      loading={loading}
      error={error}
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
        subtitleText: t(i18nDescriptionKey),
        url: docsURL,
        showButton: false,
      }}
      readOnly
      description={ResourceDescription}
    />
  );
}

export default HelmReleasesList;
