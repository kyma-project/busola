import React from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Button } from 'fundamental-react';

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
} from '../..';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { handleDelete } from '../GenericList/actionHandlers/simpleDelete';
import { useWindowTitle } from '../../hooks';
import { prettifyNamePlural } from '../ResourcesList/helpers';

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

  const {
    loading = true,
    error,
    data: resource,
    silentRefetch,
  } = useGet(props.resourceUrl, { pollingInterval: 3000 });

  const updateResourceMutation = useUpdate(props.resourceUrl);
  const deleteResourceMutation = useDelete(props.resourceUrl);

  if (loading) return 'Loading...';
  if (error) return `Error: ${error.message}`;

  return (
    <YamlEditorProvider>
      {resource && (
        <Resource
          key={resource.metadata.name}
          deleteResourceMutation={deleteResourceMutation}
          updateResourceMutation={updateResourceMutation}
          silentRefetch={silentRefetch}
          resource={resource}
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
  namespace,
  resourceName,
  filter,
  headerActions,
  resourceHeaderActions,
  windowTitle,
  readOnly,
}) {
  useWindowTitle(windowTitle || prettifyNamePlural(null, resourceType));
  const setEditedSpec = useYamlEditor();
  const notification = useNotification();

  const breadcrumbs = [
    {
      name: resourceType,
      path: '/',
      fromAbsolutePath: resourceType === 'namespaces',
    },
    { name: '' },
  ];
  const actions = readOnly ? null : (
    <>
      {headerActions}

      {resourceHeaderActions.map(resourceAction => resourceAction(resource))}
      <Button onClick={() => openYaml(resource)} option="emphasized">
        Edit YAML
      </Button>
      <Button onClick={handleResourceDelete} option="light" type="negative">
        Delete
      </Button>
    </>
  );

  const openYaml = resource => {
    const { status, ...otherResourceData } = resource; // remove 'status' property because you can't edit it anyway; TODO: decide if it's good
    setEditedSpec(otherResourceData, handleSaveClick(otherResourceData));
  };

  const handleSaveClick = resourceData => async newYAML => {
    try {
      const diff = createPatch(resourceData, jsyaml.safeLoad(newYAML));

      await updateResourceMutation(resourceUrl, diff);
      silentRefetch();
      notification.notifySuccess({ title: 'Succesfully updated Resource' });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Failed to update the Resource',
        content: e.message,
      });
      throw e;
    }
  };

  async function handleResourceDelete() {
    return await handleDelete(
      resourceType,
      null,
      resourceName,
      () => deleteResourceMutation(resourceUrl),
      () => navigateToList(resourceType),
    );
  }

  return (
    <>
      <PageHeader
        title={resource.metadata.name}
        actions={actions}
        breadcrumbItems={breadcrumbs}
      >
        <PageHeader.Column key="Labels" title="Labels" columnSpan="1 / 3">
          <Labels labels={resource.metadata.labels || {}} />
        </PageHeader.Column>

        <PageHeader.Column key="Created" title="Created">
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
