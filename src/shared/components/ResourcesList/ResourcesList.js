import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Button, Text } from '@ui5/webcomponents-react';
import { cloneDeep } from 'lodash';
import jp from 'jsonpath';
import pluralize from 'pluralize';
import { useRecoilState } from 'recoil';

import { columnLayoutState } from 'state/columnLayoutAtom';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { prettifyNamePlural, prettifyNameSingular } from 'shared/utils/helpers';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useTranslation } from 'react-i18next';
import { nameLocaleSort, timeSort } from '../../helpers/sortingfunctions';
import { useVersionWarning } from 'hooks/useVersionWarning';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { createPortal } from 'react-dom';
import BannerCarousel from 'components/Extensibility/components/FeaturedCard/BannerCarousel';
import { useGetInjections } from 'components/Extensibility/useGetInjection';
import { useNavigate } from 'react-router';

const Injections = React.lazy(() =>
  import('../../../components/Extensibility/ExtensibilityInjections'),
);

/* to allow cloning of a resource set the following on the resource create component:
 *
 * ResourceCreate.allowCreate = true;
 *
 * also to apply custom changes to the resource for cloning:
 * remove specific elements:
 * ConfigMapsCreate.sanitizeClone = [
 *   '$.blahblah'
 * ];
 * ConfigMapsCreate.sanitizeClone = resource => {
 *   // do something
 *   return resource;
 * }
 */

ResourcesList.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  createResourceForm: PropTypes.func,
  customHeaderActions: PropTypes.node,
  createActionLabel: PropTypes.string,
  resourceUrl: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  resourceTitle: PropTypes.string,
  namespace: PropTypes.string,
  hasDetailsView: PropTypes.bool,
  isCompact: PropTypes.bool,
  showTitle: PropTypes.bool,
  filter: PropTypes.func,
  listHeaderActions: PropTypes.node,
  description: PropTypes.node,
  readOnly: PropTypes.bool,
  customUrl: PropTypes.func,
  testid: PropTypes.string,
  omitColumnsIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  resourceUrlPrefix: PropTypes.string,
  disableCreate: PropTypes.bool,
  disableDelete: PropTypes.bool,
  disableMargin: PropTypes.bool,
  enableColumnLayout: PropTypes.bool,
  layoutNumber: PropTypes.string,
  filterFn: PropTypes.func,
};

export function ResourcesList({
  customHeaderActions = null,
  resourceUrl,
  resourceType,
  resourceTitle,
  isCompact,
  description,
  layoutNumber = 'startColumn',
  resources,
  filterFn = () => true,
  ...props
}) {
  const headerInjections = useGetInjections(resourceType, 'list-header');
  if (!resourceUrl) {
    return <></>; // wait for the context update
  }

  const allProps = {
    customHeaderActions,
    resourceUrl,
    resourceType,
    resourceTitle,
    isCompact,
    description,
    layoutNumber,
    resources,
    filterFn,
    ...props,
  };

  const content = (
    <>
      <BannerCarousel
        children={
          <Injections
            destination={resourceType}
            slot="banner"
            root={resources}
          />
        }
      />
      {resources ? (
        <ResourceListRenderer
          resources={(resources || []).filter(filterFn)}
          {...allProps}
        />
      ) : (
        <Resources {...allProps} />
      )}
    </>
  );

  const headerActions = headerInjections.length ? (
    <>
      <Injections
        destination={resourceType}
        slot="list-header"
        root={resources}
      />
      {customHeaderActions}
    </>
  ) : (
    customHeaderActions
  );

  return (
    <>
      {!isCompact ? (
        <DynamicPageComponent
          layoutNumber={layoutNumber}
          title={prettifyNamePlural(resourceTitle, resourceType)}
          actions={headerActions}
          description={description}
          content={content}
        />
      ) : (
        content
      )}
    </>
  );
}

function Resources(props) {
  const {
    resourceTitle,
    resourceType,
    filter,
    resourceUrl,
    skipDataLoading,
    isCompact,
  } = props;
  useWindowTitle(prettifyNamePlural(resourceTitle, resourceType), {
    skip: isCompact,
  });

  const { loading, error, data: resources, silentRefetch } = useGetList()(
    resourceUrl,
    {
      pollingInterval: 3000,
      skip: skipDataLoading,
    },
  );

  return (
    <ResourceListRenderer
      loading={loading}
      error={error}
      silentRefetch={silentRefetch}
      {...props}
      resources={filter ? (resources || []).filter(filter) : resources || []}
    />
  );
}

export function ResourceListRenderer({
  resourceUrl,
  resourceType,
  resourceTitle,
  namespace,
  customColumns = [],
  columns,
  createResourceForm: CreateResourceForm = null,
  createActionLabel,
  hasDetailsView,
  title,
  showTitle = false,
  listHeaderActions = null,
  readOnly = false,
  customUrl,
  testid,
  omitColumnsIds = ['namespace'],
  customListActions = [],
  pagination,
  loading,
  error,
  resources,
  resourceUrlPrefix,
  nameSelector = entry => entry?.metadata.name, // overriden for CRDGroupList
  disableCreate = false,
  disableDelete = false,
  disableMargin = false,
  enableColumnLayout = false,
  columnLayout,
  customColumnLayout,
  layoutCloseCreateUrl,
  layoutNumber = 'startColumn',
  sortBy = {
    name: nameLocaleSort,
    time: timeSort,
  },
  searchSettings,
  isCompact,
  parentCrdName,
  emptyListProps = null,
  simpleEmptyListMessage = false,
  disableHiding,
  displayArrow,
  accessibleName,
}) {
  useVersionWarning({
    resourceUrl,
    resourceType,
  });
  const { t } = useTranslation();
  const {
    isProtected,
    protectedResourceWarning,
    protectedResourcePopover,
  } = useProtectedResources();
  const navigate = useNavigate();
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceTitle,
    resourceType,
    layoutNumber,
    redirectBack: false,
    parentCrdName,
  });

  const [activeResource, setActiveResource] = useState(null);

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const defaultColumns = [
    {
      header: t('common.headers.name'),
      value: entry =>
        hasDetailsView ? (
          <Text style={{ fontWeight: 'bold', color: 'var(--sapLinkColor)' }}>
            {nameSelector(entry)}
          </Text>
        ) : (
          <b>{nameSelector(entry)}</b>
        ),
      id: 'name',
    },
    {
      header: t('common.headers.namespace'),
      value: entry => entry.metadata.namespace,
      id: 'namespace',
    },
    {
      header: t('common.headers.created'),
      value: entry => (
        <ReadableCreationTimestamp
          timestamp={entry.metadata.creationTimestamp}
        />
      ),
      id: 'created',
    },
  ];

  const isNamespaceAll = namespace === '-all-';
  if (isNamespaceAll) {
    omitColumnsIds = omitColumnsIds.filter(id => id !== 'namespace');
  }

  customColumns =
    columns ||
    [...defaultColumns, ...customColumns].filter(
      col => !omitColumnsIds.includes(col.id),
    );

  const prepareResourceUrl = (resourceUrl, resource) => {
    const encodedName = encodeURIComponent(resource?.metadata.name);
    const namespace = resource?.metadata?.namespace;
    const pluralKind = pluralize((resource?.kind || '').toLowerCase());

    if (!resourceUrlPrefix) {
      if (window.location.pathname.includes('namespaces/-all-/')) {
        const url = `${resourceUrl}`.substring(
          0,
          `${resourceUrl}`.lastIndexOf('/'),
        );
        return `${url}/namespaces/${namespace}/${pluralKind}/${encodedName}`;
      }
      return `${resourceUrl}/${encodedName}`;
    }

    return namespace && namespace !== '-all-'
      ? `${resourceUrlPrefix}/namespaces/${namespace}/${pluralKind}/${encodedName}`
      : `${resourceUrlPrefix}/${pluralKind}/${encodedName}`;
  };

  const handleResourceClone = resource => {
    let activeResource = cloneDeep(resource);
    jp.value(activeResource, '$.metadata.name', '');
    delete activeResource.metadata.uid;
    delete activeResource.metadata.resourceVersion;
    delete activeResource.metadata.creationTimestamp;
    delete activeResource.metadata.managedFields;
    delete activeResource.metadata.ownerReferences;
    delete activeResource.status;

    if (Array.isArray(CreateResourceForm.sanitizeClone)) {
      CreateResourceForm.sanitizeClone.forEach(path =>
        jp.remove(activeResource, path),
      );
    } else if (typeof CreateResourceForm.sanitizeClone === 'function') {
      activeResource = CreateResourceForm.sanitizeClone(activeResource);
    }
    setActiveResource(activeResource);

    setLayoutColumn(
      layoutNumber === 'midColumn' && enableColumnLayout
        ? {
            ...layoutState,
            midColumn: layoutState?.midColumn,
            endColumn: null,
            showCreate: {
              resourceType: resourceType,
              namespaceId: namespace,
              resource: activeResource,
            },
            showEdit: null,
            layout: 'ThreeColumnsEndExpanded',
          }
        : {
            ...layoutState,
            midColumn: null,
            endColumn: null,
            showCreate: {
              resourceType: resourceType,
              namespaceId: namespace,
              resource: activeResource,
            },
            showEdit: null,
            layout: 'TwoColumnsMidExpanded',
          },
    );

    navigate(
      `${layoutCloseCreateUrl ?? window.location.pathname}?${
        layoutNumber === 'midColumn' ? 'layout=TwoColumnsMidExpanded&' : ''
      }showCreate=true`,
    );
  };

  const actions = readOnly
    ? customListActions
    : [
        CreateResourceForm?.allowClone
          ? {
              name: t('common.buttons.clone'),
              tooltip: t('common.buttons.clone'),
              icon: entry => 'duplicate',
              handler: handleResourceClone,
            }
          : null,
        {
          name: t('common.buttons.delete'),
          tooltip: entry =>
            isProtected(entry)
              ? t('common.tooltips.protected-resources-info')
              : disableDelete
              ? t('common.buttons.button-disabled')
              : t('common.buttons.delete'),
          icon: 'delete',
          disabledHandler: entry => isProtected(entry) || disableDelete,
          handler: resource => {
            handleResourceDelete({
              resourceUrl: prepareResourceUrl(resourceUrl, resource),
            });
            setActiveResource(resource);
          },
        },
        ...customListActions,
      ].filter(e => e);

  const nameColIndex = customColumns.findIndex(col => col?.id === 'name');
  const namespaceColIndex = customColumns.findIndex(
    col => col?.id === 'namespace',
  );

  const headerRenderer = () => {
    return customColumns?.map(col => col?.header || null);
  };

  const rowRenderer = entry => {
    const rowColumns = customColumns?.map((col, index) => {
      if (col?.value && index === nameColIndex) {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              wordBreak: 'break-word',
            }}
          >
            {col.value(entry)}
            {protectedResourceWarning(entry)}
          </div>
        );
      }
      return col?.value ? col.value(entry) : null;
    });

    return rowColumns;
  };

  const handleShowCreate = () => {
    setActiveResource(undefined);
    setLayoutColumn(
      layoutNumber === 'midColumn' && enableColumnLayout
        ? {
            ...layoutState,
            midColumn: layoutState?.midColumn,
            endColumn: null,
            showCreate: {
              resourceType: layoutState?.midColumn.resourceName,
              namespaceId: namespace,
            },
            showEdit: null,
            layout: 'ThreeColumnsEndExpanded',
          }
        : {
            ...layoutState,
            midColumn: null,
            endColumn: null,
            showCreate: {
              resourceType: resourceType,
              namespaceId: namespace,
            },
            showEdit: null,
            layout: 'TwoColumnsMidExpanded',
          },
    );

    navigate(
      `${layoutCloseCreateUrl ?? window.location.pathname}${
        layoutNumber === 'midColumn'
          ? '?layout=ThreeColumnsEndExpanded'
          : '?layout=TwoColumnsMidExpanded'
      }&showCreate=true`,
    );
  };

  const extraHeaderContent = listHeaderActions || [
    CreateResourceForm && !disableCreate && !isNamespaceAll && (
      <Button
        key={`create-${resourceType}`}
        data-testid={`create-${resourceType}`}
        design="Emphasized"
        onClick={handleShowCreate}
      >
        {createActionLabel || t('components.resources-list.create')}
      </Button>
    ),
  ];

  const textSearchProperties = () => {
    const defaultSearchProperties = ['metadata.name', 'metadata.labels'];

    if (typeof searchSettings?.textSearchProperties === 'function')
      return searchSettings.textSearchProperties(defaultSearchProperties);

    return [
      ...defaultSearchProperties,
      ...(searchSettings?.textSearchProperties || []),
    ];
  };

  const processTitle = title => {
    const words = title.split(' ');
    let uppercaseCount = 0;

    const processedWords = words?.map(word => {
      for (let i = 0; i < word.length; i++) {
        if (word[i] === word[i].toUpperCase()) {
          uppercaseCount++;

          if (uppercaseCount > 1) {
            uppercaseCount = 0;
            return word;
          }
        }
      }
      uppercaseCount = 0;
      return word.toLowerCase();
    });

    return processedWords.join(' ');
  };

  return (
    <>
      {createPortal(
        <DeleteMessageBox
          resource={activeResource}
          resourceUrl={prepareResourceUrl(resourceUrl, activeResource)}
        />,
        document.body,
      )}
      {!(error && error.status === 'Definition not found') && (
        <>
          {protectedResourcePopover()}
          <GenericList
            displayArrow={displayArrow ?? true}
            disableHiding={disableHiding ?? false}
            hasDetailsView={hasDetailsView}
            customUrl={customUrl}
            resourceType={resourceType}
            customColumnLayout={customColumnLayout}
            columnLayout={columnLayout}
            enableColumnLayout={enableColumnLayout}
            disableMargin={disableMargin}
            title={showTitle ? title || prettifiedResourceName : null}
            accessibleName={
              accessibleName ?? prettifyNamePlural(resourceTitle, resourceType)
            }
            actions={actions}
            entries={resources || []}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            serverDataError={error}
            serverDataLoading={loading}
            pagination={{ autoHide: true, ...pagination }}
            extraHeaderContent={extraHeaderContent}
            testid={testid}
            sortBy={sortBy}
            searchSettings={{
              ...searchSettings,
              textSearchProperties: textSearchProperties(),
            }}
            emptyListProps={{
              titleText: `${t('common.labels.no')} ${processTitle(
                prettifyNamePlural(resourceTitle, resourceType),
              )}`,
              onClick: handleShowCreate,
              showButton: !disableCreate && namespace !== '-all-',
              ...emptyListProps,
              simpleEmptyListMessage: simpleEmptyListMessage,
            }}
            nameColIndex={nameColIndex}
            namespaceColIndex={namespaceColIndex}
          />
        </>
      )}
      {!isCompact && createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
