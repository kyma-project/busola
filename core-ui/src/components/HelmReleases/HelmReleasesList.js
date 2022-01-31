import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation, Trans } from 'react-i18next';
import {
  useMicrofrontendContext,
  useGetList,
  PageHeader,
  Link as ExternalLink,
  Labels,
  GenericList,
} from 'react-shared';
import { Link } from 'fundamental-react';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';

const groupBy = (arr, fn) =>
  arr.reduce((acc, curr) => {
    if (!acc[fn(curr)]) {
      acc[fn(curr)] = [];
    }
    acc[fn(curr)].push(curr);
    return acc;
  }, {});

export function HelmReleasesList() {
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
    t('helm-releases.headers.version'),
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
    entry.recentRelease?.chart.metadata.name || 'unknown',
    entry.revision,
    entry.recentRelease?.chart.metadata.version || 'unknown',
  ];

  const entries = Object.entries(
    groupBy(data || [], r => r.metadata.labels.name),
  ).map(([releaseName, releases]) => {
    const recentRelease = releases.find(findRecentRelease);
    return {
      releaseName,
      recentReleaseName: recentRelease?.metadata.name,
      recentRelease: decodeHelmRelease(recentRelease?.data.release),
      revision: releases.length,
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
      />
    </>
  );
}
