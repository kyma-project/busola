import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Link, Button } from 'fundamental-react';
import { createPatch } from 'rfc6902';
import { cloneDeep } from 'lodash';
import * as jp from 'jsonpath';

import {
  YamlEditorProvider,
  GenericList,
  Labels,
  useYamlEditor,
  useNotification,
  useGetList,
  useUpdate,
  PageHeader,
  navigateToDetails,
  navigateToFixedPathResourceDetails,
  prettifyNameSingular,
  prettifyNamePlural,
  ErrorBoundary,
} from '../..';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { ModalWithForm } from '../ModalWithForm/ModalWithForm';
import { ReadableCreationTimestamp } from '../ReadableCreationTimestamp/ReadableCreationTimestamp';
import {
  useWindowTitle,
  useProtectedResources,
  useDeleteResource,
} from '../../hooks';
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

function Resources({
  resourceUrl,
  resourceType,
  resourceName,
  namespace,
  customColumns,
  createResourceForm: CreateResourceForm,
  createActionLabel,
  hasDetailsView,
  fixedPath,
  title,
  showTitle,
  filter,
  listHeaderActions,
  windowTitle,
  readOnly,
  isCompact = false,
  navigateFn,
  skipDataLoading = false,
  testid,
  i18n,
  textSearchProperties = [],
  omitColumnsIds = [],
  customListActions = [],
  createFormProps,
  pagination,
}) {
  useWindowTitle(windowTitle || prettifyNamePlural(resourceName, resourceType));
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

  const { loading = true, error, data: resources, silentRefetch } = useGetList(
    filter,
  )(resourceUrl, { pollingInterval: 3000, skip: skipDataLoading });

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
      resource.metadata.name + '.yaml',
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
          if (fixedPath)
            return navigateToFixedPathResourceDetails(
              resourceType,
              entry.metadata.name,
            );
          navigateToDetails(resourceType, entry.metadata.name);
        }}
      >
        {entry.metadata.name}
      </Link>
    ) : (
      <b>{entry.metadata.name}</b>
    ),
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
        resourceUrl={`${resourceUrl}/${activeResource?.metadata.name}`}
      />
      <GenericList
        title={
          showTitle
            ? title || prettifyNamePlural(resourceName, resourceType)
            : null
        }
        textSearchProperties={[
          'metadata.name',
          'metadata.labels',
          ...textSearchProperties,
        ]}
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
