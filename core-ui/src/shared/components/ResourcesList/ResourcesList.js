import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Link, Button } from 'fundamental-react';
import { createPatch } from 'rfc6902';
import { cloneDeep } from 'lodash';
import * as jp from 'jsonpath';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { navigateToDetails } from 'shared/hooks/navigate';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { navigateToResource } from 'shared/hooks/navigate';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { YamlEditorProvider } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { prettifyNameSingular, prettifyNamePlural } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { GenericList } from 'shared/components/GenericList/GenericList';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useTranslation } from 'react-i18next';
import { nameLocaleSort, timeSort } from '../../helpers/sortingfunctions';
import { useVersionWarning } from 'hooks/useVersionWarning';
import pluralize from 'pluralize';

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
  fixedPath: PropTypes.bool,
  isCompact: PropTypes.bool,
  showTitle: PropTypes.bool,
  filter: PropTypes.func,
  listHeaderActions: PropTypes.node,
  description: PropTypes.node,
  readOnly: PropTypes.bool,
  navigateFn: PropTypes.func,
  testid: PropTypes.string,
  omitColumnsIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  resourceUrlPrefix: PropTypes.string,
  disableCreate: PropTypes.bool,
};

ResourcesList.defaultProps = {
  customHeaderActions: null,
  customColumns: [],
  createResourceForm: null,
  showTitle: false,
  listHeaderActions: null,
  readOnly: false,
  disableCreate: false,
};

export function ResourcesList(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  }

  return (
    <YamlEditorProvider>
      {!props.isCompact && (
        <PageHeader
          title={prettifyNamePlural(props.resourceTitle, props.resourceType)}
          actions={props.customHeaderActions}
          description={props.description}
        />
      )}
      {props.resources ? (
        <ResourceListRenderer
          resources={(props.resources || []).filter(props.filterFn)}
          {...props}
        />
      ) : (
        <Resources {...props} />
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
  fixedPath,
  title,
  showTitle,
  listHeaderActions,
  readOnly,
  navigateFn,
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
  sortBy = {
    name: nameLocaleSort,
    time: timeSort,
  },
  searchSettings,
}) {
  useVersionWarning({
    resourceUrl,
    resourceType,
  });
  const { t } = useTranslation();
  const { isProtected, protectedResourceWarning } = useProtectedResources();

  const [toggleFormFn, getToggleFormFn] = useState(() => {});

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceTitle,
    resourceType,
  });

  const [activeResource, setActiveResource] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const {
    setEditedYaml: setEditedSpec,
    closeEditor,
    currentlyEditedResourceUID,
  } = useYamlEditor();
  const notification = useNotification();
  const updateResourceMutation = useUpdate(resourceUrl);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => closeEditor(), [namespace]);

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const defaultColumns = [
    {
      header: t('common.headers.name'),
      value: entry =>
        hasDetailsView ? (
          <Link
            className="fd-link"
            onClick={_ => {
              if (navigateFn) return navigateFn(entry);
              if (fixedPath) return navigateToResource(entry);
              navigateToDetails(resourceType, entry.metadata.name);
            }}
          >
            {nameSelector(entry)}
          </Link>
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

  customColumns =
    columns ||
    [...defaultColumns, ...customColumns].filter(
      col => !omitColumnsIds.includes(col.id),
    );

  const handleSaveClick = resourceData => async newYAML => {
    try {
      const diff = createPatch(resourceData, jsyaml.load(newYAML));
      const url = prepareResourceUrl(resourceUrl, resourceData);

      await updateResourceMutation(url, diff);
      silentRefetch();
      notification.notifySuccess({
        content: t('components.resources-list.messages.update.success', {
          resourceType: prettifiedResourceName,
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resources-list.messages.update.failure', {
          resourceType: prettifiedResourceName,
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const handleResourceEdit = resource => {
    setEditedSpec(
      resource,
      nameSelector(resource) + '.yaml',
      handleSaveClick(resource),
      isProtected(resource),
      isProtected(resource),
    );
  };

  const prepareResourceUrl = (resourceUrl, resource) => {
    const encodedName = encodeURIComponent(resource?.metadata.name);
    if (!resourceUrlPrefix) return `${resourceUrl}/${encodedName}`;

    const namespace = resource?.metadata?.namespace;
    const pluralKind = pluralize((resource?.kind || '').toLowerCase());

    return namespace
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
    setShowEditDialog(true);
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
              : t('common.buttons.edit'),
          icon: entry => (isProtected(entry) ? 'show-edit' : 'edit'),
          handler: handleResourceEdit,
        },
        {
          name: t('common.buttons.delete'),
          tooltip: entry =>
            isProtected(entry)
              ? t('common.tooltips.protected-resources-info')
              : t('common.buttons.delete'),
          icon: 'delete',
          disabledHandler: isProtected,
          handler: resource => {
            handleResourceDelete({
              resourceUrl: prepareResourceUrl(resourceUrl, resource),
            });
            setActiveResource(resource);
          },
        },
        ...customListActions,
      ].filter(e => e);

  const headerRenderer = () => [
    ...customColumns.map(col => col.header || null),
    '',
  ];

  const rowRenderer = entry => [
    ...customColumns.map(col => (col.value ? col.value(entry) : null)),
    protectedResourceWarning(entry),
  ];

  const extraHeaderContent = listHeaderActions || [
    CreateResourceForm && !disableCreate && (
      <Button
        glyph="add"
        option="transparent"
        onClick={() => {
          setActiveResource(undefined);
          setShowEditDialog(true);
        }}
      >
        {createActionLabel ||
          t('components.resources-list.create', {
            resourceType: prettifiedResourceName,
          })}
      </Button>
    ),
  ];

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
        opened={showEditDialog}
        confirmText={t('common.buttons.create')}
        id={`add-${resourceType}-modal`}
        className="modal-size--l create-resource-modal"
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
              {...props}
              {...createFormProps}
            />
          </ErrorBoundary>
        )}
        modalOpeningComponent={<></>}
        customCloseAction={() => setShowEditDialog(false)}
      />
      <DeleteMessageBox
        resource={activeResource}
        resourceUrl={prepareResourceUrl(resourceUrl, activeResource)}
      />
      <GenericList
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
          textSearchProperties: [
            'metadata.name',
            'metadata.namespace',
            'metadata.labels',
            ...(searchSettings?.textSearchProperties || []),
          ],
          ...searchSettings,
        }}
      />
    </>
  );
}
