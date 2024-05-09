import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash';
import { Tokens } from 'shared/components/Tokens';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { ResourceListRenderer } from 'shared/components/ResourcesList/ResourcesList';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { SearchInput } from 'shared/components/GenericList/SearchInput';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { createPortal } from 'react-dom';

export function GroupingListPage({
  title,
  description,
  filter,
  resourceListProps,
  showCrdScope,
  enableColumnLayout,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  useWindowTitle(title);

  const resourceUrl = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const { data, loading, error } = useGetList(filter)(resourceUrl);
  const crdsByGroup = groupBy(data, e => e.spec.group);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <UI5Panel title={error.message} />;
  }

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
              resourceTitle="customresourcedefinition"
              hasDetailsView={true}
              enableColumnLayout={enableColumnLayout}
              showTitle={true}
              title={group}
              resources={crds}
              isCompact={true}
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
              searchSettings={{
                showSearchField: false,
              }}
              {...resourceListProps}
            />
          </li>
        ))}
    </ul>
  );

  return (
    <>
      <DynamicPageComponent
        title={title}
        description={description}
        actions={
          <SearchInput
            value={searchQuery}
            handleQueryChange={setSearchQuery}
            allowSlashShortcut
          />
        }
        content={lists}
        layoutNumber="StartColumn"
      />

      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
