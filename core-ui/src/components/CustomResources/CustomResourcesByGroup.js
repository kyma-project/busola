import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Link as FdLink } from 'fundamental-react';
import pluralize from 'pluralize';
import { GroupingListPage } from './GroupingListPage';

export default function CustomResourcesByGroup({ namespace }) {
  const { t } = useTranslation();

  const navigateToCustomResourceList = crd => {
    LuigiClient.linkManager()
      .fromContext(namespace ? 'namespace' : 'cluster')
      .navigate('/customresources/' + crd.metadata.name);
  };

  const description = (
    <Trans i18nKey="custom-resources.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/"
      />
      <FdLink
        className="fd-link"
        onClick={() =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate('/customresourcedefinitions')
        }
      />
    </Trans>
  );

  return (
    <GroupingListPage
      title={t('custom-resources.title')}
      description={description}
      filter={crd => crd.spec.scope === (namespace ? 'Namespaced' : 'Cluster')}
      resourceListProps={{
        navigateFn: navigateToCustomResourceList,
        nameSelector: entry => pluralize(entry?.spec.names.kind || ''),
        readOnly: true,
      }}
    />
  );
}
