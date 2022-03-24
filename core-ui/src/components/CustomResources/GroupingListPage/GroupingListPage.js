import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetList,
  YamlEditorProvider,
  ResourceListRenderer,
  Spinner,
} from 'react-shared';
import { groupBy } from 'lodash';
import { Tokens } from 'shared/components/Tokens';
import { FormInput, LayoutPanel } from 'fundamental-react';
import { PageHeader } from 'react-shared/';
import './GroupingListPage.scss';
import { useWindowTitle } from 'react-shared/';

export function GroupingListPage({
  title,
  description,
  filter,
  resourceListProps,
  showCrdScope,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, i18n } = useTranslation();
  useWindowTitle(title);

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
                ...(showCrdScope
                  ? [
                      {
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

  const header = (
    <PageHeader
      title={title}
      description={description}
      actions={
        <FormInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="fd-margin-begin--lg search-with-magnifying-glass group-list-search"
          type="search"
        />
      }
    />
  );

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <Spinner compact={true} />
      </div>
    );
  }

  if (error) {
    return (
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {error.message}
      </LayoutPanel>
    );
  }

  return (
    <>
      {header}
      <YamlEditorProvider i18n={i18n}>{lists}</YamlEditorProvider>
    </>
  );
}
