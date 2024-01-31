import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Link as RRLink } from 'react-router-dom';
import pluralize from 'pluralize';
import { GroupingListPage } from './GroupingListPage';
import { useUrl } from 'hooks/useUrl';

export default function CustomResourcesByGroup({ enableColumnLayout }) {
  const { t } = useTranslation();
  const { namespace, clusterUrl, scopedUrl } = useUrl();
  const description = (
    <Trans i18nKey="custom-resources.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/"
      />
      <RRLink
        className="bsl-link"
        to={clusterUrl(`customresourcedefinitions`)}
      />
    </Trans>
  );

  return (
    <GroupingListPage
      title={t('custom-resources.title')}
      description={description}
      filter={crd => crd.spec.scope === (namespace ? 'Namespaced' : 'Cluster')}
      resourceListProps={{
        customUrl: crd => scopedUrl(`customresources/${crd.metadata.name}`),
        nameSelector: entry => pluralize(entry?.spec.names.kind || ''),
        readOnly: true,
      }}
      enableColumnLayout={enableColumnLayout}
    />
  );
}
