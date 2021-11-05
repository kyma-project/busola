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
  }
  // eslint-disable react-hooks/rules-of-hooks
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
  silentRefetch,
  resource,
  children,
  customColumns,
  customComponents,
  resourceUrl,
  resourceType,
  updateResourceMutation,
  deleteResourceMutation,
  resourceName,
  headerActions,
  resourceHeaderActions,
  windowTitle,
  readOnly,
  breadcrumbs,
  i18n,
}) {
  useWindowTitle(windowTitle || prettifyNamePlural(null, resourceType));
  const { isProtected, protectedResourceWarning } = useProtectedResources(i18n);

  const { t } = useTranslation(['translation'], { i18n });
  const { setEditedYaml: setEditedSpec } = useYamlEditor();
  const notification = useNotification();

  const prettifiedResourceName = prettifyNameSingular(undefined, resourceType);

  const breadcrumbItems = breadcrumbs || [
    {
      name: prettifyNamePlural(null, resourceType),
      path: '/',
      fromContext: resourceType.toLowerCase(),
    },
    { name: '' },
  ];

  const protectedResource = isProtected(resource);

  const actions = readOnly ? null : (
    <>
      {protectedResourceWarning(resource)}
      <Button
        className="fd-margin-end--tiny"
        onClick={() => openYaml(resource)}
        option="emphasized"
      >
        {protectedResource
          ? t('common.buttons.view-yaml')
          : t('common.buttons.edit-yaml')}
      </Button>
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
      resourceType,
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
