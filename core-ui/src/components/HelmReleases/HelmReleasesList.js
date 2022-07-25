import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation, Trans } from 'react-i18next';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Labels } from 'shared/components/Labels/Labels';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link as ExternalLink } from 'shared/components/Link/Link';
import { Link } from 'fundamental-react';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { groupBy } from 'lodash';

function HelmReleasesList() {
  const { t, i18n } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const { data, loading, error } = useGetList(
    s => s.type === 'helm.sh/release.v1',
  )(`/api/v1/namespaces/${namespace}/secrets`);

  const headerRenderer = () => [
    t('common.headers.name'),
    t('common.headers.labels'),
    t('helm-releases.headers.chart'),
    t('helm-releases.headers.revision'),
    t('helm-releases.headers.chart-version'),
    t('common.headers.status'),
  ];

  const rowRenderer = entry => [
    <Link
      onClick={() =>
        LuigiClient.linkManager().navigate('details/' + entry.releaseName)
      }
    >
      {entry.releaseName}
    </Link>,
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
    };
  });

  return (
    <>
      <PageHeader
        title={t('helm-releases.title')}
        description={
          <Trans i18nKey={'helm-releases.description'}>
            <ExternalLink
              className="fd-link"
              url="https://helm.sh/docs/glossary/#release"
            />
          </Trans>
        }
      />
      <GenericList
        textSearchProperties={['recentRelease.chart.metadata.name']}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        i18n={i18n}
        serverDataLoading={loading}
        serverDataError={error}
        allowSlashShortcut
        sortBy={{
          name: (a, b) => a.releaseName.localeCompare(b.releaseName),
        }}
      />
    </>
  );
}
export default HelmReleasesList;
