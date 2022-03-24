import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Trans, useTranslation } from 'react-i18next';
import { PageHeader, Link } from 'react-shared';
import { FormInput, Link as FdLink } from 'fundamental-react';
import pluralize from 'pluralize';
import { GroupingList } from './GroupingList';
import { useWindowTitle } from 'react-shared/hooks';

export default function CustomResourcesByGroup({ namespace }) {
  const { t } = useTranslation();
  useWindowTitle(t('custom-resources.title'));

  const [searchQuery, setSearchQuery] = useState('');

  const navigateToCustomResourceList = crd => {
    if (namespace) {
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate('/customresources/' + crd.metadata.name);
    } else {
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('/customresources/' + crd.metadata.name);
    }
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

  const header = (
    <PageHeader
      title={t('custom-resources.title')}
      description={description}
      actions={
        <FormInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="fd-margin-begin--lg this-will-be-removed-later"
          type="search"
        />
      }
    />
  );

  return (
    <>
      {header}
      <GroupingList
        searchQuery={searchQuery}
        filter={crd =>
          crd.spec.scope === (namespace ? 'Namespaced' : 'Cluster')
        }
        resourceListProps={{
          navigateFn: navigateToCustomResourceList,
          nameSelector: entry => pluralize(entry?.spec.names.kind || ''),
          readOnly: true,
        }}
      />
    </>
  );
}
