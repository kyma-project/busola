import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Button, Link } from '@ui5/webcomponents-react';
import { createPatch } from 'rfc6902';
import { cloneDeep } from 'lodash';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';
import { useRecoilState } from 'recoil';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { usePut, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useGetList, useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { YamlEditorProvider } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { prettifyNameSingular, prettifyNamePlural } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { nameLocaleSort, timeSort } from '../../helpers/sortingfunctions';
import { useVersionWarning } from 'hooks/useVersionWarning';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { ForceUpdateModalContent } from 'shared/ResourceForm/ForceUpdateModalContent';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { createPortal } from 'react-dom';

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
  customUrl: PropTypes.string,
  testid: PropTypes.string,
  omitColumnsIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  resourceUrlPrefix: PropTypes.string,
  disableCreate: PropTypes.bool,
  disableEdit: PropTypes.bool,
  disableDelete: PropTypes.bool,
  disableMargin: PropTypes.bool,
  enableColumnLayout: PropTypes.bool,
  layoutNumber: PropTypes.string,
};

ResourcesList.defaultProps = {
  customHeaderActions: null,
  customColumns: [],
  createResourceForm: null,
  showTitle: false,
  listHeaderActions: null,
  readOnly: false,
  disableCreate: false,
  disableEdit: false,
  disableDelete: false,
  disableMargin: false,
  enableColumnLayout: false,
  layoutNumber: 'StartColumn',
  filterFn: () => true,
};

export function ResourcesList(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  }

  const content = props.resources ? (
    <ResourceListRenderer
      resources={(props.resources || []).filter(props.filterFn)}
      {...props}
    />
  ) : (
    <Resources {...props} />
  );

  return (
    <YamlEditorProvider>
      {!props.isCompact ? (
        <DynamicPageComponent
          layoutNumber={props.layoutNumber}
          title={prettifyNamePlural(props.resourceTitle, props.resourceType)}
          actions={
            <>
              <Injections
                destination={props.resourceType}
                slot="list-header"
                root={props.resources}
              />
              {props.customHeaderActions}
            </>
          }
          description={props.description}
          content={content}
        />
      ) : (
        content
      )}
    </YamlEditorProvider>
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
      resources={filter ? (resources || []).filter(filter) : resources || []}
      silentRefetch={silentRefetch}
      {...props}
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
  createResourceForm: CreateResourceForm,
  createActionLabel,
  hasDetailsView,
  title,
  showTitle,
  listHeaderActions,
  readOnly,
  customUrl,
  testid,
  omitColumnsIds = ['namespace'],
  customListActions = [],
  createFormProps,
  pagination,
  loading,
  error,
  resources,
  silentRefetch = () => {},
  resourceUrlPrefix,
  nameSelector = entry => entry?.metadata.name, // overriden for CRDGroupList
  disableCreate,
  disableEdit,
  disableDelete,
  disableMargin,
  enableColumnLayout,
  columnLayout,
  customColumnLayout,
  layoutNumber = 'StartColumn',
  sortBy = {
    name: nameLocaleSort,
    time: timeSort,
  },
  searchSettings,
  isCompact,
}) {
  useVersionWarning({
    resourceUrl,
    resourceType,
  });
  const { t } = useTranslation();
  const { isProtected, protectedResourceWarning } = useProtectedResources();
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);

  const [toggleFormFn, getToggleFormFn] = useState(() => {});

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceTitle,
    resourceType,
    layoutNumber,
    redirectBack: false,
  });

  const [activeResource, setActiveResource] = useState(null);
  const {
    setEditedYaml: setEditedSpec,
    closeEditor,
    currentlyEditedResourceUID,
  } = useYamlEditor();
  const notification = useNotification();
  const getRequest = useSingleGet();
  const updateResourceMutation = useUpdate(resourceUrl);
  const putRequest = usePut();
  const { resourceUrl: resourceUrlFn } = useUrl();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => closeEditor(), [namespace]);

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const linkTo = entry =>
    customUrl ? customUrl(entry) : resourceUrlFn(entry, { resourceType });
  const defaultColumns = [
    {
      header: t('common.headers.name'),
      value: entry =>
        hasDetailsView ? (
          enableColumnLayout ? (
            <>
              <Link
                style={{ fontWeight: 'bold' }}
                onClick={() => {
                  setLayoutColumn(
                    columnLayout
                      ? {
                          midColumn: layoutState.midColumn,
                          endColumn: customColumnLayout(entry),
                          layout: columnLayout,
                        }
                      : {
                          midColumn: {
                            resourceName: entry?.metadata?.name,
                            resourceType: resourceType,
                            namespaceId: entry?.metadata?.namespace,
                          },
                          endColumn: null,
                          layout: 'TwoColumnsMidExpanded',
                        },
                  );

                  window.history.pushState(
                    window.history.state,
                    '',
                    `${linkTo(entry)}?layout=${columnLayout ||
                      'TwoColumnsMidExpanded'}`,
                  );
                }}
              >
                {nameSelector(entry)}
              </Link>
            </>
          ) : (
            <Link style={{ fontWeight: 'bold' }} href={linkTo(entry)}>
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
    {
      header: t('common.headers.labels'),
      value: entry => (
        <div style={{ maxWidth: '36rem' }}>
          <Labels labels={entry.metadata.labels} shortenLongLabels />
        </div>
      ),
      id: 'labels',
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

  const handleSaveClick = resourceData => async newYAML => {
    const showError = e => {
      console.error(e);
      notification.notifyError({
        content: t('components.resources-list.messages.update.failure', {
          resourceType: prettifiedResourceName,
          error: e.message,
        }),
      });
    };

    const onSuccess = () => {
      silentRefetch();
      notification.notifySuccess({
        content: t('components.resources-list.messages.update.success', {
          resourceType: prettifiedResourceName,
        }),
      });
    };

    const modifiedResource = jsyaml.load(newYAML);
    const diff = createPatch(resourceData, modifiedResource);
    const url = prepareResourceUrl(resourceUrl, resourceData);
    try {
      await updateResourceMutation(url, diff);
      onSuccess();
    } catch (e) {
      const isConflict = e instanceof HttpError && e.code === 409;
      if (isConflict) {
        const response = await getRequest(url);
        const updatedResource = await response.json();

        const makeForceUpdateFn = closeModal => {
          return async () => {
            delete modifiedResource?.metadata?.resourceVersion;
            try {
              await putRequest(url, modifiedResource);
              closeModal();
              onSuccess();
              if (typeof toggleFormFn === 'function') {
                toggleFormFn(false);
              }
              closeEditor();
            } catch (e) {
              showError(e);
            }
          };
        };

        notification.notifyError({
          content: (
            <ForceUpdateModalContent
              error={e}
              singularName={resourceType}
              initialResource={updatedResource}
              modifiedResource={modifiedResource}
            />
          ),
          actions: (closeModal, defaultCloseButton) => [
            <Button onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        showError(e);
      }
      // throw error so that drawer doesn't close
      throw e;
    }
  };

  const handleResourceEdit = resource => {
    setEditedSpec(
      resource,
      nameSelector(resource) + '.yaml',
      handleSaveClick(resource),
      isProtected(resource) || disableEdit,
      isProtected(resource),
    );
  };

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
    toggleFormFn(true);
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
          name: t('common.buttons.edit'),
          tooltip: entry =>
            isProtected(entry)
              ? t('common.tooltips.protected-resources-view-yaml')
              : disableEdit
              ? t('common.buttons.view-yaml')
              : t('common.buttons.edit'),
          icon: entry =>
            isProtected(entry) || disableEdit ? 'show-edit' : 'edit',
          handler: handleResourceEdit,
        },
        {
          name: t('common.buttons.delete'),
          tooltip: entry =>
            isProtected(entry)
              ? t('common.tooltips.protected-resources-info')
              : disableDelete
              ? null
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

  const nameColIndex = customColumns.findIndex(col => col.id === 'name');

  const headerRenderer = () => {
    const rowColumns = customColumns.map(col => col.header || null);
    rowColumns.splice(nameColIndex + 1, 0, '');
    return rowColumns;
  };

  const rowRenderer = entry => {
    const rowColumns = customColumns.map(col =>
      col.value ? col.value(entry) : null,
    );
    rowColumns.splice(nameColIndex + 1, 0, protectedResourceWarning(entry));
    return rowColumns;
  };

  const extraHeaderContent = listHeaderActions || [
    CreateResourceForm && !disableCreate && !isNamespaceAll && (
      <Button
        icon="add"
        design="Transparent"
        onClick={() => {
          setActiveResource(undefined);
          toggleFormFn(true);
        }}
      >
        {createActionLabel ||
          t('components.resources-list.create', {
            resourceType: prettifiedResourceName,
          })}
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

  return (
    <>
      <ModalWithForm
        title={
          createActionLabel ||
          t('components.resources-list.create', {
            resourceType: prettifiedResourceName,
          })
        }
        getToggleFormFn={getToggleFormFn}
        confirmText={t('common.buttons.create')}
        id={`add-${resourceType}-modal`}
        className="modal-size--l"
        renderForm={props => (
          <ErrorBoundary>
            <CreateResourceForm
              resource={activeResource}
              resourceType={resourceType}
              resourceTitle={resourceTitle}
              resourceUrl={resourceUrl}
              namespace={namespace}
              refetchList={silentRefetch}
              toggleFormFn={toggleFormFn}
              layoutNumber={layoutNumber}
              {...props}
              {...createFormProps}
            />
          </ErrorBoundary>
        )}
        modalOpeningComponent={<></>}
      />
      {createPortal(
        <DeleteMessageBox
          resource={activeResource}
          resourceUrl={prepareResourceUrl(resourceUrl, activeResource)}
        />,
        document.body,
      )}
      {!(error && error.toString().includes('is forbidden')) && (
        <GenericList
          disableMargin={disableMargin}
          title={showTitle ? title || prettifiedResourceName : null}
          actions={actions}
          entries={resources || []}
          headerRenderer={headerRenderer}
          rowRenderer={rowRenderer}
          serverDataError={error}
          serverDataLoading={loading}
          pagination={{ autoHide: true, ...pagination }}
          extraHeaderContent={extraHeaderContent}
          testid={testid}
          currentlyEditedResourceUID={currentlyEditedResourceUID}
          sortBy={sortBy}
          searchSettings={{
            ...searchSettings,
            textSearchProperties: textSearchProperties(),
          }}
        />
      )}
      {!isCompact && createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
