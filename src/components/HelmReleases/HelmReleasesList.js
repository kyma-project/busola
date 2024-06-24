import { useNavigate } from 'react-router-dom';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import { useTranslation } from 'react-i18next';
import { Link, Text } from '@ui5/webcomponents-react';
import { groupBy } from 'lodash';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { decodeHelmRelease } from './decodeHelmRelease';
import { findRecentRelease } from './findRecentRelease';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { ResourceDescription } from 'components/HelmReleases';
import { createPortal } from 'react-dom';

function HelmReleasesList({ enableColumnLayout = true }) {
  const { t } = useTranslation();
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { namespaceUrl } = useUrl();
  const navigate = useNavigate();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const resourceUrl = entry => {
    return namespaceUrl(`helm-releases/${entry.releaseName}`, {
      namespace: entry.namespace,
    });
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
    enableColumnLayout ? (
      <>
        <Text style={{ fontWeight: 'bold', color: 'var(--sapLinkColor)' }}>
          {entry.releaseName}
        </Text>
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

          navigate(resourceUrl(entry));
        }}
      >
        {entry.releaseName}
      </Link>
    ),
    namespace === '-all-' ? entry.namespace : null,
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
      name: releaseName,
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
        layoutNumber={'StartColumn'}
        content={
          <GenericList
            entries={entries}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            serverDataLoading={loading}
            serverDataError={error}
            allowSlashShortcut
            hasDetailsView
            displayArrow
            enableColumnLayout={enableColumnLayout}
            customUrl={resourceUrl}
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
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}

export default HelmReleasesList;
