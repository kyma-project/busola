import React, { Suspense } from 'react';
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
import { useGet, useGet3 } from 'shared/hooks/BackendAPI/useGet';
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
    return (
      <ResourceDetailsRenderer
        {...props}
        // todo
        resourceUrl={props.resourceUrl + props.resourceName}
      />
    );
  }
}

function ResourceDetailsRenderer(props) {
  let { loading = true, error, data: resource, cachedResultsOnly } = useGet3({
    apiPath: props.apiPath,
    namespace: props.namespace,
    name: props.resourceName,
    resourceType: props.resourceType,
    pollingInterval: 3000,
  });

  const updateResourceMutation = useUpdate(props.resourceUrl);
  const deleteResourceMutation = useDelete(props.resourceUrl);
  const silentRefetch = () => {
    console.log('todo silentRefetch');
  };

  if (loading) return <Spinner />;
  if (error) {
    const breadcrumbItems = props.breadcrumbs || [
      {
        name: prettifyNamePlural(props.resourceTitle || props.resourceType),
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
          i18n={props.i18n}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(props.resourceTitle, props.resourceType)}
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
  editActionLabel,
  headerActions,
  i18n,
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
}) {
  console.log('render, resourceKind:', resource.kind);
  const { t } = useTranslation(['translation'], { i18n });
  const prettifiedResourceKind = prettifyNameSingular(
    resourceTitle,
    resource.kind,
  );
  const pluralizedResourceKind = pluralize(prettifiedResourceKind);
  useWindowTitle(windowTitle || pluralizedResourceKind);
  const { isProtected, protectedResourceWarning } = useProtectedResources(i18n);

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    i18n,
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
        <Button
          className="fd-margin-end--tiny"
          onClick={() => openYaml(resource)}
        >
          {t('common.buttons.view-yaml')}
        </Button>
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
            <ErrorBoundary i18n={i18n}>
              <CreateResourceForm
                resource={resource}
                resourceType={resourceType}
                resourceUrl={resourceUrl}
                namespace={namespace}
                refetchList={silentRefetch}
                {...props}
              />
            </ErrorBoundary>
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
        onClick={() => handleResourceDelete({ resourceUrl })}
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
      <DeleteMessageBox resource={resource} resourceUrl={resourceUrl} />
      {customComponents.map(component => component(resource, resourceUrl))}
      {children}
      {resourceGraphConfig?.[resource.kind] && (
        <Suspense fallback={<Spinner />}>
          <ResourceGraph
            resource={resource}
            i18n={i18n}
            config={resourceGraphConfig}
          />
        </Suspense>
      )}
    </>
  );
}
