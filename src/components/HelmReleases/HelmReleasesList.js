import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import { useTranslation, Trans } from 'react-i18next';
import { Link } from '@ui5/webcomponents-react';
import { groupBy } from 'lodash';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Labels } from 'shared/components/Labels/Labels';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link as ExternalLink } from 'shared/components/Link/Link';

import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

function HelmReleasesList({ enableColumnLayout }) {
  const { t } = useTranslation();
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { namespaceUrl } = useUrl();
  const navigate = useNavigate();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);

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

  const helmDetailsURL = releaseName =>
    namespaceUrl(`helm-releases/${releaseName}`);
  const rowRenderer = entry => [
    enableColumnLayout ? (
      <>
        <Link
          style={{ fontWeight: 'bold' }}
          onClick={() => {
            setLayoutColumn({
              midColumn: {
                resourceName: entry.releaseName,
                resourceType: 'HelmReleases',
                namespaceId: namespace,
              },
              endColumn: null,
              layout: 'TwoColumnsMidExpanded',
            });

            window.history.pushState(
              window.history.state,
              '',
              `${helmDetailsURL(
                entry.releaseName,
              )}?layout=TwoColumnsMidExpanded`,
            );
          }}
        >
          {entry.releaseName}
        </Link>
      </>
    ) : (
      <Link
        style={{ fontWeight: 'bold' }}
        onClick={() => {
          setLayoutColumn({
            midColumn: null,
            endColumn: null,
            layout: 'OneColumn',
          });

          navigate(helmDetailsURL(entry.releaseName));
        }}
      >
        {entry.releaseName}
      </Link>
    ),
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
      <DynamicPageComponent
        title={t('helm-releases.title')}
        description={
          <Trans i18nKey={'helm-releases.description'}>
            <ExternalLink
              className="bsl-link"
              url="https://helm.sh/docs/glossary/#release"
            />
          </Trans>
        }
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
