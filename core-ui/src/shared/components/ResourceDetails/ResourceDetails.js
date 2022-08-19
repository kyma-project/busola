import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';
import { createPatch } from 'rfc6902';
import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useDelete, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { YamlEditorProvider } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import {
  getErrorMessage,
  prettifyNameSingular,
  prettifyNamePlural,
} from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Spinner } from 'shared/components/Spinner/Spinner';

import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { useVersionWarning } from 'hooks/useVersionWarning';
import { Tooltip } from '../Tooltip/Tooltip';

// This component is loaded after the page mounts.
// Don't try to load it on scroll. It was tested.
// It doesn't affect the lighthouse score, but it prolongs the graph waiting time.
const ResourceGraph = React.lazy(() =>
  import('../ResourceGraph/ResourceGraph'),
);

ResourceDetails.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  children: PropTypes.node,
  customComponents: PropTypes.arrayOf(PropTypes.func),
  resourceUrl: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  resourceName: PropTypes.string,
  resourceTitle: PropTypes.string,
  namespace: PropTypes.string,
  headerActions: PropTypes.node,
  resourceHeaderActions: PropTypes.arrayOf(PropTypes.func),
  readOnly: PropTypes.bool,
  breadcrumbs: PropTypes.array,
  editActionLabel: PropTypes.string,
  windowTitle: PropTypes.string,
  resourceGraphConfig: PropTypes.object,
  resourceSchema: PropTypes.object,
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
        name: prettifyNamePlural(props.resourceTitle, props.resourceType),
        path: '/',
        fromContext: props.resourceType.toLowerCase(),
      },
      { name: '' },
    ];
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource={prettifyNameSingular(
            props.resourceTitle,
            props.resourceType,
          )}
          breadcrumbs={breadcrumbItems}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(props.resourceTitle, props.resourceType)}
        breadcrumbs={breadcrumbItems}
        customMessage={getErrorMessage(error)}
      />
    );
  }

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
  breadcrumbs,
  children,
  createResourceForm: CreateResourceForm,
  customColumns,
  customComponents,
  editActionLabel,
  headerActions,
  namespace,
  readOnly,
  resource,
  resourceHeaderActions,
  resourceType,
  resourceUrl,
  silentRefetch,
  updateResourceMutation,
  windowTitle,
  resourceTitle,
  resourceGraphConfig,
  resourceSchema,
}) {
  useVersionWarning({ resourceUrl, resourceType });
  const { t } = useTranslation();
  const prettifiedResourceKind = prettifyNameSingular(
    resourceTitle,
    resource.kind,
  );
  const [toggleFormFn, getToggleFormFn] = useState(() => {});

  const pluralizedResourceKind = pluralize(prettifiedResourceKind);
  useWindowTitle(windowTitle || pluralizedResourceKind);
  const { isProtected, protectedResourceWarning } = useProtectedResources();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceTitle,
    resourceType,
    navigateToListAfterDelete: true,
  });

  const { setEditedYaml: setEditedSpec } = useYamlEditor();
  const notification = useNotification();

  const breadcrumbItems = breadcrumbs || [
    {
      name: pluralizedResourceKind,
      path: '/',
      fromContext: pluralize(resource.kind).toLowerCase(),
    },
    { name: '' },
  ];

  const protectedResource = isProtected(resource);

  const editAction = () => {
    if (protectedResource) {
      return (
        <Tooltip
          className="actions-tooltip"
          content={t('common.tooltips.protected-resources-info')}
        >
          <Button
            className="fd-margin-end--tiny"
            onClick={() => openYaml(resource)}
          >
            {t('common.buttons.view-yaml')}
          </Button>
        </Tooltip>
      );
    } else if (!CreateResourceForm || !CreateResourceForm?.allowEdit) {
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
          getToggleFormFn={getToggleFormFn}
          title={
            editActionLabel ||
            t('components.resource-details.edit', {
              resourceType: prettifiedResourceKind,
            })
          }
          modalOpeningComponent={
            <Button className="fd-margin-end--tiny" option="emphasized">
              {editActionLabel ||
                t('components.resource-details.edit', {
                  resourceType: prettifiedResourceKind,
                })}
            </Button>
          }
          confirmText={t('common.buttons.update')}
          id={`edit-${resourceType}-modal`}
          className="modal-size--l create-resource-modal"
          renderForm={props => (
            <ErrorBoundary>
              <CreateResourceForm
                resource={resource}
                resourceType={resourceType}
                resourceUrl={resourceUrl}
                namespace={namespace}
                refetchList={silentRefetch}
                toggleFormFn={toggleFormFn}
                resourceSchema={resourceSchema}
                {...props}
              />
            </ErrorBoundary>
          )}
        />
      );
    }
  };

  const deleteButtonWrapper = children => {
    if (protectedResource) {
      return (
        <Tooltip
          className="actions-tooltip"
          content={t('common.tooltips.protected-resources-info')}
        >
          {children}
        </Tooltip>
      );
    } else {
      return children;
    }
  };

  const actions = readOnly ? null : (
    <>
      {protectedResourceWarning(resource)}
      {editAction()}
      {headerActions}
      {resourceHeaderActions.map(resourceAction => resourceAction(resource))}
      {deleteButtonWrapper(
        <Button
          disabled={protectedResource}
          onClick={() => handleResourceDelete({ resourceUrl })}
          option="transparent"
          type="negative"
        >
          {t('common.buttons.delete')}
        </Button>,
      )}
    </>
  );

  const openYaml = resource => {
    setEditedSpec(
      resource,
      resource.metadata.name + '.yaml',
      handleSaveClick(resource),
      protectedResource,
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
          resourceType: prettifiedResourceKind,
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resource-details.messages.failure', {
          resourceType: prettifiedResourceKind,
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const filterColumns = col => {
    const { visible, error } = col.visibility?.(resource) || {
      visible: true,
    };
    if (error) {
      col.value = () => t('common.messages.error', { error: error.message });
      return true;
    }
    return visible;
  };

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

        {customColumns.filter(filterColumns).map(col => (
          <PageHeader.Column key={col.header} title={col.header}>
            {col.value(resource)}
          </PageHeader.Column>
        ))}
      </PageHeader>
      <DeleteMessageBox resource={resource} resourceUrl={resourceUrl} />
      {(customComponents || []).map(component =>
        component(resource, resourceUrl),
      )}
      {children}
      {resourceGraphConfig?.[resource.kind] && (
        <Suspense fallback={<Spinner />}>
          <ResourceGraph resource={resource} config={resourceGraphConfig} />
        </Suspense>
      )}
    </>
  );
}
