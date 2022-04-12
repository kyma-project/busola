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

/* to allow cloning of a resource set the folowing on the resource create component:
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
  resourceName: PropTypes.string,
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
};

ResourcesList.defaultProps = {
  customHeaderActions: null,
  customColumns: [],
  createResourceForm: null,
  showTitle: false,
  listHeaderActions: null,
  readOnly: false,
};

export function ResourcesList(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  }

  return (
    <YamlEditorProvider i18n={props.i18n}>
      {!props.isCompact && (
        <PageHeader
          title={prettifyNamePlural(props.resourceName, props.resourceType)}
          actions={props.customHeaderActions}
          description={props.description}
        />
      )}
      <Resources {...props} />
    </YamlEditorProvider>
  );
}

function Resources(props) {
  const {
    windowTitle,
    resourceName,
    resourceType,
    filter,
    resourceUrl,
    skipDataLoading,
  } = props;
  useWindowTitle(windowTitle || prettifyNamePlural(resourceName, resourceType));

  const { loading, error, data: resources, silentRefetch } = useGetList(filter)(
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
      resources={resources}
      silentRefetch={silentRefetch}
      {...props}
    />
  );
}

export function ResourceListRenderer({
  resourceUrl,
  resourceType,
  resourceName,
  namespace,
  customColumns = [],
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
  i18n,
  textSearchProperties = [],
  omitColumnsIds = [],
  customListActions = [],
  createFormProps,
  pagination,
  showNamespace = false,
  loading,
  error,
  resources,
  silentRefetch = () => {},
  showSearchField = true,
  nameSelector = entry => entry?.metadata.name, // overriden for CRDGroupList
}) {
  const { t } = useTranslation(['translation'], { i18n });
  const { isProtected, protectedResourceWarning } = useProtectedResources(i18n);

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    i18n,
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
    resourceName,
    resourceType,
  );

  customColumns = customColumns.filter(col => !omitColumnsIds.includes(col.id));

  const withoutQueryString = path => path.split('?')[0];

  const handleSaveClick = resourceData => async newYAML => {
    try {
      const diff = createPatch(resourceData, jsyaml.load(newYAML));
      const url =
        withoutQueryString(resourceUrl) + '/' + resourceData.metadata.name;
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
    );
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
          tooltip: t('common.buttons.edit'),
          icon: entry => (isProtected(entry) ? 'show-edit' : 'edit'),
          handler: handleResourceEdit,
        },
        {
          name: t('common.buttons.delete'),
          tooltip: t('common.buttons.delete'),
          icon: 'delete',
          disabledHandler: isProtected,
          handler: resource => {
            handleResourceDelete({
              resourceUrl: `${resourceUrl}/${resource.metadata.name}`,
            });
            setActiveResource(resource);
          },
        },
        ...customListActions,
      ].filter(e => e);

  const headerRenderer = () => [
    t('common.headers.name'),
    ...(showNamespace ? [t('common.headers.namespace')] : []),
    t('common.headers.created'),
    t('common.headers.labels'),
    ...customColumns.map(col => col.header),
    '',
  ];

  const rowRenderer = entry => [
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
    ...(showNamespace ? [entry.metadata.namespace] : []),
    <ReadableCreationTimestamp timestamp={entry.metadata.creationTimestamp} />,
    <div style={{ maxWidth: '36rem' /*TODO*/ }}>
      <Labels labels={entry.metadata.labels} shortenLongLabels />
    </div>,
    ...customColumns.map(col => col.value(entry)),
    protectedResourceWarning(entry),
  ];

  const extraHeaderContent =
    listHeaderActions ||
    (CreateResourceForm && (
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
    ));

  return (
    <>
      <ModalWithForm
        title={
          createActionLabel ||
          t('components.resources-list.create', {
            resourceType: prettifiedResourceName,
          })
        }
        opened={showEditDialog}
        confirmText={t('common.buttons.create')}
        id={`add-${resourceType}-modal`}
        className="modal-size--l create-resource-modal"
        renderForm={props => (
          <ErrorBoundary i18n={i18n}>
            <CreateResourceForm
              resource={activeResource}
              resourceType={resourceType}
              resourceUrl={resourceUrl}
              namespace={namespace}
              refetchList={silentRefetch}
              {...props}
              {...createFormProps}
            />
          </ErrorBoundary>
        )}
        i18n={i18n}
        modalOpeningComponent={<></>}
        customCloseAction={() => setShowEditDialog(false)}
      />
      <DeleteMessageBox
        resource={activeResource}
        resourceUrl={`${resourceUrl}/${nameSelector(activeResource)}`}
      />
      <GenericList
        title={showTitle ? title || prettifiedResourceName : null}
        textSearchProperties={[
          'metadata.name',
          'metadata.namespace',
          'metadata.labels',
          ...textSearchProperties,
        ]}
        slashToSearch={true}
        showSearchField={showSearchField}
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
        i18n={i18n}
      />
    </>
  );
}
