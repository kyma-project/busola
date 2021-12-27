import React from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { createPatch } from 'rfc6902';

import {
  PageHeader,
  Labels,
  YamlEditorProvider,
  useGet,
  useUpdate,
  useDelete,
  useYamlEditor,
  useNotification,
  navigateToList,
  ReadableCreationTimestamp,
  ResourceNotFound,
  prettifyNamePlural,
  prettifyNameSingular,
  getErrorMessage,
  Spinner,
} from '../..';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { handleDelete } from '../GenericList/actionHandlers/simpleDelete';
import { useWindowTitle, useProtectedResources } from '../../hooks';
import { ModalWithForm } from '../ModalWithForm/ModalWithForm';

ResourceDetails.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  children: PropTypes.node,
  customComponents: PropTypes.arrayOf(PropTypes.func),
  resourceUrl: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  namespace: PropTypes.string,
  headerActions: PropTypes.node,
  resourceHeaderActions: PropTypes.arrayOf(PropTypes.func),
  readOnly: PropTypes.bool,
  breadcrumbs: PropTypes.array,
};

ResourceDetails.defaultProps = {
  customColumns: [],
  customComponents: [],
  headerActions: null,
  resourceHeaderActions: [],
  readOnly: false,
};

export function ResourceDetails(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  } else {
    return <ResourceDetailsRenderer {...props} />;
  }
}

function ResourceDetailsRenderer(props) {
  const {
    loading = true,
    error,
    data: resource,
    silentRefetch,
  } = useGet(props.resourceUrl, { pollingInterval: 3000 });

  const updateResourceMutation = useUpdate(props.resourceUrl);
  const deleteResourceMutation = useDelete(props.resourceUrl);

  if (loading) return <Spinner />;
  if (error) {
    const breadcrumbItems = props.breadcrumbs || [
      {
        name: props.resourceType,
        path: '/',
        fromContext: props.resourceType.toLowerCase(),
      },
      { name: '' },
    ];
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource={prettifyNameSingular(undefined, props.resourceType)}
          breadcrumbs={breadcrumbItems}
          i18n={props.i18n}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(undefined, props.resourceType)}
        breadcrumbs={breadcrumbItems}
        customMessage={getErrorMessage(error)}
        i18n={props.i18n}
      />
    );
  }

  return (
    <YamlEditorProvider i18n={props.i18n}>
      {resource && (
        <Resource
          key={resource.metadata.name}
          deleteResourceMutation={deleteResourceMutation}
          updateResourceMutation={updateResourceMutation}
          silentRefetch={silentRefetch}
          resource={resource}
          i18n={props.i18n}
          {...props}
        />
      )}
    </YamlEditorProvider>
  );
}

function Resource({
  breadcrumbs,
  children,
  createResourceForm: CreateResourceForm,
  customColumns,
  customComponents,
  deleteResourceMutation,
  editActionLabel,
  headerActions,
  i18n,
  namespace,
  readOnly,
  resource,
  resourceHeaderActions,
  resourceName,
  resourceType,
  resourceUrl,
  silentRefetch,
  updateResourceMutation,
  windowTitle,
  resourceTitle,
}) {
  useWindowTitle(
    windowTitle || resourceTitle || prettifyNamePlural(null, resourceType),
  );
  const { isProtected, protectedResourceWarning } = useProtectedResources(i18n);

  const { t } = useTranslation(['translation'], { i18n });
  const { setEditedYaml: setEditedSpec } = useYamlEditor();
  const notification = useNotification();

  const prettifiedResourceName = prettifyNameSingular(undefined, resourceType);

  const breadcrumbItems = breadcrumbs || [
    {
      name: resourceTitle || prettifyNamePlural(null, resourceType),
      path: '/',
      fromContext: resourceType.toLowerCase(),
    },
    { name: '' },
  ];

  const protectedResource = isProtected(resource);

  const editAction = () => {
    if (protectedResource) {
      return (
        <Button
          className="fd-margin-end--tiny"
          onClick={() => openYaml(resource)}
        >
          {t('common.buttons.view-yaml')}
        </Button>
      );
    } else if (!CreateResourceForm || !CreateResourceForm.allowEdit) {
      return (
        <Button
          className="fd-margin-end--tiny"
          onClick={() => openYaml(resource)}
          option="emphasized"
        >
          {t('common.buttons.edit-yaml')}
        </Button>
      );
    } else {
      return (
        <ModalWithForm
          title={
            editActionLabel ||
            t('components.resource-details.edit', {
              resourceType: prettifiedResourceName,
            })
          }
          modalOpeningComponent={
            <Button className="fd-margin-end--tiny" option="emphasized">
              {editActionLabel ||
                t('components.resource-details.edit', {
                  resourceType: prettifiedResourceName,
                })}
            </Button>
          }
          confirmText={t('common.buttons.update')}
          id={`edit-${resourceType}-modal`}
          className="modal-size--l create-resource-modal"
          renderForm={props => (
            <CreateResourceForm
              resource={resource}
              resourceType={resourceType}
              resourceUrl={resourceUrl}
              namespace={namespace}
              refetchList={silentRefetch}
              {...props}
            />
          )}
          i18n={i18n}
        />
      );
    }
  };

  const actions = readOnly ? null : (
    <>
      {protectedResourceWarning(resource)}
      {editAction()}
      {headerActions}
      {resourceHeaderActions.map(resourceAction => resourceAction(resource))}
      <Button
        disabled={protectedResource}
        onClick={handleResourceDelete}
        option="transparent"
        type="negative"
      >
        {t('common.buttons.delete')}
      </Button>
    </>
  );

  const openYaml = resource => {
    setEditedSpec(
      resource,
      resource.metadata.name + '.yaml',
      handleSaveClick(resource),
      protectedResource,
    );
  };

  const handleSaveClick = resourceData => async newYAML => {
    try {
      const diff = createPatch(resourceData, jsyaml.load(newYAML));

      await updateResourceMutation(resourceUrl, diff);
      silentRefetch();
      notification.notifySuccess({
        content: t('components.resource-details.messages.success', {
          resourceType: prettifiedResourceName,
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resource-details.messages.failure', {
          resourceType: prettifiedResourceName,
          error: e.message,
        }),
      });
      throw e;
    }
  };

  async function handleResourceDelete() {
    return handleDelete(
      resourceTitle || resourceType,
      null,
      resourceName,
      notification,
      () => deleteResourceMutation(resourceUrl),
      () => navigateToList(resourceType),
      t,
    );
  }

  return (
    <>
      <PageHeader
        title={resource.metadata.name}
        actions={actions}
        breadcrumbItems={breadcrumbItems}
      >
        <PageHeader.Column
          key="Labels"
          title={t('common.headers.labels')}
          columnSpan="1 / 3"
        >
          <Labels labels={resource.metadata.labels || {}} />
        </PageHeader.Column>

        <PageHeader.Column key="Created" title={t('common.headers.created')}>
          <ReadableCreationTimestamp
            timestamp={resource.metadata.creationTimestamp}
          />
        </PageHeader.Column>

        {customColumns.map(col => (
          <PageHeader.Column key={col.header} title={col.header}>
            {col.value(resource)}
          </PageHeader.Column>
        ))}
      </PageHeader>

      {customComponents.map(component => component(resource, resourceUrl))}

      {children}
    </>
  );
}
