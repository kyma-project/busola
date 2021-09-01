import React from 'react';
import LuigiClient from '@luigi-project/client';
import { GenericList, useGetList } from 'react-shared';
import { Link, Button } from 'fundamental-react';
import './PodList.scss';
import { useTranslation } from 'react-i18next';

const navigateTo = path => _ =>
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(path);

export default function PodList({ namespace, functionName, isActive }) {
  const labelSelectors = `serverless.kyma-project.io/function-name=${functionName},serverless.kyma-project.io/resource=deployment`;
  const resourceUrl = `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelectors}`;
  const { data: pods, error, loading = true } = useGetList()(resourceUrl, {
    pollingInterval: 4000,
    skip: !isActive,
  });

  const { t } = useTranslation();

  const headerRenderer = () => [
    t('common.headers.name'),
    t('common.headers.logs'),
  ];

  const rowRenderer = entry => [
    <Link
      className="fd-link"
      onClick={navigateTo(`pods/details/${entry.metadata.name}`)}
    >
      {entry.metadata.name}
    </Link>,
    <Button
      onClick={navigateTo(
        `pods/details/${entry.metadata.name}/containers/function`,
      )}
      glyph="form"
    >
      {t('functions.pod-list.buttons.view-logs')}
    </Button>,
  ];

  return (
    <GenericList
      className="pods-of-function"
      showSearchField={false}
      compact
      title={t('functions.pod-list.title')}
      entries={pods || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
    />
  );
}
