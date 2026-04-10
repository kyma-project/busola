import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import {
  LinkDomRef,
  Text,
  ToolbarButton,
  Ui5CustomEvent,
} from '@ui5/webcomponents-react';
import { cloneDeep } from 'lodash';
import jp from 'jsonpath';
import pluralize from 'pluralize';
import { useAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { prettifyNamePlural, prettifyNameSingular } from 'shared/utils/helpers';
import {
  EmptyListProps,
  GenericList,
} from 'shared/components/GenericList/GenericList';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { nameLocaleSort, timeSort } from '../../helpers/sortingfunctions';
import { useVersionWarning } from 'hooks/useVersionWarning';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { useUrl } from 'hooks/useUrl';
import { Link } from '../Link/Link';
import { ProtectedResourceWarning } from '../ProtectedResourcesButton';
import DeleteResourceModal from '../DeleteResourceModal/DeleteResourceModal';
import { ResourceListRendererProps } from './types';
import { K8sResource } from 'types';
import { LinkClickEventDetail } from '@ui5/webcomponents/dist/Link';

export function ResourceListRenderer({
  resourceUrl,
  resourceType,
  rawResourceType,
  resourceTitle,
  namespace,
  customColumns = [],
  columns,
  createResourceForm,
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
  nameSelector = (entry) => entry?.metadata.name, // overriden for CRDGroupList
  disableCreate = false,
  disableDelete = false,
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
  emptyListProps = {} as EmptyListProps,
  simpleEmptyListMessage = false,
  disableHiding,
  displayArrow = enableColumnLayout,
  accessibleName,
  createFormRef = null,
}: ResourceListRendererProps) {
  useVersionWarning({
    resourceUrl,
    resourceType,
  });
  const { t } = useTranslation();
  const { isProtected } = useProtectedResources();
  const navigate = useNavigate();
  const [layoutState, setLayoutColumn] = useAtom(columnLayoutAtom);

  const {
    showDeleteDialog,
    handleResourceDelete,
    performDelete,
    performCancel,
  } = useDeleteResource({
    resourceTitle,
    resourceType,
    layoutNumber,
    redirectBack: false,
    parentCrdName,
  });

  const [activeResource, setActiveResource] = useState<Record<
    string,
    any
  > | null>(null);

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );
  const { resourceUrl: resourceUrlFn } = useUrl();

  const linkTo = (entry: K8sResource) => {
    return customUrl
      ? customUrl(entry)
      : resourceUrlFn(entry, { resourceType });
  };

  const onLinkClick = (
    entry: K8sResource & { apiVersion?: string; metadata: { group?: string } },
    e: Ui5CustomEvent<LinkDomRef, LinkClickEventDetail>,
  ) => {
    e.preventDefault();

    setLayoutColumn({
      midColumn: null,
      showCreate: null,
      endColumn: null,
      layout: 'OneColumn',
      showEdit: null,
      startColumn: {
        resourceName: entry?.metadata?.name ?? e.target.innerText,
        resourceType: resourceType,
        rawResourceTypeName: rawResourceType,
        namespaceId: entry?.metadata?.namespace ?? null,
        apiGroup: entry.metadata.group,
        apiVersion: entry.apiVersion,
      },
    });

    navigate(`${linkTo(entry)}`);
  };

  const defaultColumns = [
    {
      header: t('common.headers.name'),
      value: (entry: K8sResource) =>
        hasDetailsView ? (
          enableColumnLayout ? (
            <Text style={{ fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
              {nameSelector(entry)}
            </Text>
          ) : (
            <Link
              url={`${linkTo(entry)}`}
              onClick={(e: Ui5CustomEvent<LinkDomRef, LinkClickEventDetail>) =>
                onLinkClick(entry, e)
              }
              style={{ fontWeight: 'bold' }}
            >
              {nameSelector(entry)}
            </Link>
          )
        ) : (
          <b>{nameSelector(entry)}</b>
        ),
      id: 'name',
    },
    {
      header: t('common.headers.namespace'),
      value: (entry: K8sResource) => entry.metadata.namespace,
      id: 'namespace',
    },
    {
      header: t('common.headers.created'),
      value: (entry: K8sResource) => (
        <ReadableCreationTimestamp
          timestamp={entry.metadata.creationTimestamp}
        />
      ),
      id: 'created',
    },
  ];

  const isNamespaceAll = namespace === '-all-';
  if (isNamespaceAll) {
    omitColumnsIds = omitColumnsIds.filter((id) => id !== 'namespace');
  }

  customColumns =
    columns ||
    [...defaultColumns, ...customColumns].filter(
      (col) => !omitColumnsIds.includes(col.id as any),
    );

  const prepareResourceUrl = (resourceUrl: string, resource: K8sResource) => {
    const encodedName = encodeURIComponent(resource?.metadata?.name);
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

  const handleResourceClone = (resource: Record<string, any>) => {
    let activeResource = cloneDeep(resource);
    jp.value(activeResource, '$.metadata.name', '');
    delete activeResource.metadata.uid;
    delete activeResource.metadata.resourceVersion;
    delete activeResource.metadata.creationTimestamp;
    delete activeResource.metadata.managedFields;
    delete activeResource.metadata.ownerReferences;
    delete activeResource.status;

    if (Array.isArray(createResourceForm?.sanitizeClone)) {
      createResourceForm?.sanitizeClone.forEach((path) =>
        jp.apply(activeResource, path, () => undefined),
      );
    } else if (typeof createResourceForm?.sanitizeClone === 'function') {
      activeResource = createResourceForm?.sanitizeClone(activeResource);
    }
    setActiveResource(activeResource);

    setLayoutColumn(
      layoutNumber === 'midColumn' && enableColumnLayout
        ? {
            ...layoutState,
            midColumn: layoutState?.midColumn ?? null,
            endColumn: null,
            showCreate: {
              resourceType: resourceType ?? null,
              rawResourceTypeName: rawResourceType,
              namespaceId: namespace ?? null,
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
              resourceType: resourceType ?? null,
              rawResourceTypeName: rawResourceType,
              namespaceId: namespace ?? null,
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
        createResourceForm?.allowClone
          ? {
              name: t('common.buttons.clone'),
              tooltip: t('common.buttons.clone'),
              icon: () => 'duplicate',
              handler: handleResourceClone,
            }
          : null,
        {
          name: t('common.buttons.delete'),
          tooltip: (entry: Record<string, any>) =>
            isProtected(entry)
              ? t('common.tooltips.protected-resources-info')
              : disableDelete
                ? t('common.buttons.button-disabled')
                : t('common.buttons.delete'),
          icon: 'delete',
          disabledHandler: (entry: Record<string, any>) =>
            isProtected(entry) || disableDelete,
          handler: (resource: K8sResource) => {
            handleResourceDelete({
              resourceUrl: prepareResourceUrl(resourceUrl, resource),
            } as any);
            setActiveResource(resource);
          },
        },
        ...customListActions,
      ].filter((e) => !!e);

  const nameColIndex = customColumns.findIndex((col) => col?.id === 'name');
  const namespaceColIndex = customColumns.findIndex(
    (col) => col?.id === 'namespace',
  );

  const headerRenderer = () => {
    return customColumns?.map((col) => col?.header || null);
  };

  const columnWidths = customColumns?.map((col) => col?.width);

  const rowRenderer = (entry: any) => {
    const rowColumns = customColumns?.map((col, index) => {
      if (col?.value && index === nameColIndex) {
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              wordBreak: 'break-word',
              height: '100%',
              width: '100%',
            }}
          >
            {col.value(entry)}
            <ProtectedResourceWarning entry={entry} />
          </div>
        );
      }
      return col?.value ? col.value(entry) : null;
    });

    return rowColumns;
  };

  const handleShowCreate = () => {
    setActiveResource(null);
    setLayoutColumn(
      layoutNumber === 'midColumn' && enableColumnLayout
        ? {
            ...layoutState,
            midColumn: layoutState?.midColumn ?? null,
            endColumn: null,
            showCreate: {
              resourceType: layoutState?.midColumn?.resourceName ?? null,
              rawResourceTypeName: rawResourceType,
              namespaceId: namespace ?? null,
            },
            showEdit: null,
            layout: 'ThreeColumnsEndExpanded',
          }
        : {
            ...layoutState,
            midColumn: null,
            endColumn: null,
            showCreate: {
              resourceType: resourceType ?? null,
              rawResourceTypeName: rawResourceType,
              namespaceId: namespace ?? null,
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

    setTimeout(() => {
      if (createFormRef?.current) {
        createFormRef.current.focus();
      }
    }, 0);
  };

  const extraHeaderContent = listHeaderActions || [
    createResourceForm && !disableCreate && !isNamespaceAll && (
      <ToolbarButton
        key={`create-${resourceType}`}
        data-testid={`create-${resourceType}`}
        design="Emphasized"
        onClick={handleShowCreate}
        text={createActionLabel || t('components.resources-list.create')}
      />
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
  return (
    <>
      {createPortal(
        <DeleteResourceModal
          resource={activeResource}
          resourceUrl={prepareResourceUrl(
            resourceUrl,
            (activeResource as K8sResource) || ({} as K8sResource),
          )}
          resourceType={rawResourceType || resourceType}
          performCancel={performCancel}
          performDelete={performDelete}
          showDeleteDialog={showDeleteDialog}
        />,
        document.body,
      )}
      {!(error && error.status === 'Definition not found') && (
        <GenericList
          displayArrow={displayArrow ?? true}
          disableHiding={disableHiding ?? false}
          hasDetailsView={hasDetailsView}
          customUrl={customUrl}
          resourceType={resourceType}
          rawResourceType={rawResourceType}
          customColumnLayout={customColumnLayout}
          columnLayout={columnLayout}
          enableColumnLayout={enableColumnLayout}
          title={showTitle ? title || prettifiedResourceName : undefined}
          accessibleName={
            accessibleName ?? prettifyNamePlural(resourceTitle, resourceType)
          }
          actions={actions}
          entries={(resources || []) as any[]}
          headerRenderer={headerRenderer}
          columnWidths={columnWidths}
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
            onClick: handleShowCreate,
            showButton: !disableCreate && namespace !== '-all-',
            ...emptyListProps,
            titleText:
              emptyListProps?.titleText ??
              `${t('common.labels.no')} ${prettifyNamePlural(
                resourceTitle,
                resourceType,
              )}`,
            simpleEmptyListMessage: simpleEmptyListMessage,
          }}
          nameColIndex={nameColIndex}
          namespaceColIndex={namespaceColIndex}
        />
      )}
      {!isCompact && createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
