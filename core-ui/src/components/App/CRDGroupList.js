import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Trans, useTranslation } from 'react-i18next';
import {
  useGetList,
  YamlEditorProvider,
  PageHeader,
  Link,
  ResourceListRenderer,
  Spinner,
} from 'react-shared';
import { groupBy } from 'lodash';
import { FormInput, Link as FdLink } from 'fundamental-react';
import { Tokens } from 'shared/components/Tokens';
import pluralize from 'pluralize';

function GroupingList({ filter, searchQuery, resourceListProps, a }) {
  const { t, i18n } = useTranslation();

  const resourceUrl = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const { data, loading, error } = useGetList(filter)(resourceUrl);
  const crdsByGroup = groupBy(data, e => e.spec.group);

  let entries = Object.entries(crdsByGroup);
  if (searchQuery) {
    const query = searchQuery.toLowerCase();

    const removeEmpty = ([, crds]) => crds.length;

    const filterBySearchQuery = crd =>
      crd.metadata.name.includes(query) ||
      crd.spec.names.categories?.includes(query);

    entries = entries
      .map(([group, crds]) => [group, crds.filter(filterBySearchQuery)])
      .filter(removeEmpty);
  }

  const lists = (
    <ul>
      {entries
        .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
        .map(([group, crds]) => (
          <li key={group}>
            <ResourceListRenderer
              resourceUrl={resourceUrl}
              resourceType="CustomResourceDefinition"
              resourceName="customresourcedefinition"
              hasDetailsView={true}
              showSearchField={false}
              showTitle={true}
              title={group}
              i18n={i18n}
              resources={crds}
              customColumns={[
                {
                  header: t('custom-resource-definitions.headers.categories'),
                  value: entry => (
                    <Tokens tokens={entry.spec.names.categories} />
                  ),
                },
                ...(a
                  ? [
                      {
                        //todo
                        header: t('scope'),
                        value: entry => entry.spec.scope,
                      },
                    ]
                  : []),
              ]}
              {...resourceListProps}
            />
          </li>
        ))}
    </ul>
  );

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <Spinner compact={true} />
      </div>
    );
  }

  if (error) {
    // todo
    return error.message;
  }

  return <YamlEditorProvider i18n={i18n}>{lists}</YamlEditorProvider>;
}

export function CustomResourceGroupList({ namespace }) {
  const { t } = useTranslation();

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

export function CRDGroupList() {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');

  const navigateToCrdDetails = crd =>
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate('/customresourcedefinitions/details/' + crd.metadata.name);

  const description = (
    <Trans i18nKey="custom-resource-definitions.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/"
      />
    </Trans>
  );

  const header = (
    <PageHeader
      title={t('custom-resource-definitions.title')}
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
        a
        searchQuery={searchQuery}
        resourceListProps={{ navigateFn: navigateToCrdDetails }}
      />
    </>
  );
}
