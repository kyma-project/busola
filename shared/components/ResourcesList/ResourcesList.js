import React, { useState } from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import {
  Link,
  Button,
  Checkbox,
  MessageBox,
  MessageStrip,
} from 'fundamental-react';
import { createPatch } from 'rfc6902';
import LuigiClient from '@luigi-project/client';

import {
  YamlEditorProvider,
  GenericList,
  Labels,
  useYamlEditor,
  useNotification,
  useGetList,
  useUpdate,
  useDelete,
  PageHeader,
  navigateToDetails,
  navigateToFixedPathResourceDetails,
  prettifyNameSingular,
  prettifyNamePlural,
} from '../..';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { ModalWithForm } from '../ModalWithForm/ModalWithForm';
import { ReadableCreationTimestamp } from '../ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useWindowTitle, useFeatureToggle } from '../../hooks';
import { useTranslation } from 'react-i18next';

ResourcesList.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  createResourceForm: PropTypes.func,
  customHeaderActions: PropTypes.node,
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

export const ResourcesListProps = ResourcesList.propTypes;

function Resources({
  resourceUrl,
  resourceType,
  resourceName,
  namespace,
  customColumns,
  createResourceForm: CreateResourceForm,
  hasDetailsView,
  fixedPath,
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
}) {
  useWindowTitle(windowTitle || prettifyNamePlural(resourceName, resourceType));
  const { t } = useTranslation(['translation'], { i18n });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const {
    setEditedYaml: setEditedSpec,
    closeEditor,
    currentlyEditedResourceUID,
  } = useYamlEditor();
  const notification = useNotification();
  const updateResourceMutation = useUpdate(resourceUrl);
  const deleteResourceMutation = useDelete(resourceUrl);
  const { loading = true, error, data: resources, silentRefetch } = useGetList(
    filter,
  )(resourceUrl, { pollingInterval: 3000, skip: skipDataLoading });
  React.useEffect(() => closeEditor(), [namespace]);
  const [dontConfirmDelete, setDontConfirmDelete] = useFeatureToggle(
    'dontConfirmDelete',
  );
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

  const performDelete = async resource => {
    const url = withoutQueryString(resourceUrl) + '/' + resource.metadata.name;
    const name = prettifyNameSingular(resourceType);

    LuigiClient.sendCustomMessage({
      id: 'busola.dontConfirmDelete',
      value: dontConfirmDelete,
    });
    try {
      await deleteResourceMutation(url);
      notification.notifySuccess({
        content: t('components.resources-list.messages.delete.success', {
          resourceType: prettifiedResourceName,
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resources-list.messages.delete.failure', {
          resourceType: prettifiedResourceName,
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const closeDeleteDialog = () => {
    LuigiClient.uxManager().removeBackdrop();
    setShowDeleteDialog(false);
  };

  async function handleResourceDelete(resource) {
    if (dontConfirmDelete) {
      performDelete(resource);
    } else {
      LuigiClient.uxManager().addBackdrop();
      setActiveResource(resource);
      setShowDeleteDialog(true);
    }
  }

  const actions = readOnly
    ? []
    : [
        {
          name: 'Edit',
          handler: resource => {
            setEditedSpec(
              resource,
              resource.metadata.name + '.yaml',
              handleSaveClick(resource),
            );
          },
        },
        {
          name: 'Delete',
          handler: handleResourceDelete,
        },
      ];

  const headerRenderer = () => [
    t('common.headers.name'),
    t('common.headers.created'),
    t('common.headers.labels'),
    ...customColumns.map(col => col.header),
  ];

  const rowRenderer = entry => [
    hasDetailsView ? (
      <Link
        className="fd-link"
        onClick={_ => {
          if (navigateFn) return navigateFn(entry.metadata.name);
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
  ];

  const extraHeaderContent =
    listHeaderActions ||
    (CreateResourceForm && (
      <ModalWithForm
        title={t('components.resources-list.create', {
          resourceType: prettifiedResourceName,
        })}
        modalOpeningComponent={
          <Button glyph="add" option="transparent">
            {t('components.resources-list.create', {
              resourceType: prettifiedResourceName,
            })}
          </Button>
        }
        confirmText={t('common.buttons.create')}
        id={`add-${resourceType}-modal`}
        className="fd-dialog--xl-size modal-size--l create-resource-modal"
        renderForm={props => (
          <CreateResourceForm
            resourceType={resourceType}
            resourceUrl={resourceUrl}
            namespace={namespace}
            refetchList={silentRefetch}
            {...props}
          />
        )}
        i18n={i18n}
      />
    ));

  return (
    <>
      <MessageBox
        type="warning"
        title={t('common.delete-dialog.title', {
          name: activeResource?.metadata.name,
        })}
        actions={[
          <Button
            type="negative"
            compact
            onClick={() => performDelete(activeResource)}
          >
            {t('common.buttons.delete')}
          </Button>,
          <Button onClick={() => setDontConfirmDelete(false)} compact>
            {t('common.buttons.cancel')}
          </Button>,
        ]}
        show={showDeleteDialog}
        onClose={closeDeleteDialog}
      >
        <p>
          {t('common.delete-dialog.message', {
            type: prettifiedResourceName,
            name: activeResource?.metadata.name,
          })}
        </p>
        <div className="fd-margin-top--sm">
          <Checkbox onChange={e => setDontConfirmDelete(e.target.checked)}>
            {t('common.delete-dialog.delete-confirm')}
          </Checkbox>
        </div>
        {dontConfirmDelete && (
          <MessageStrip type="information" className="fd-margin-top--sm">
            {t('common.delete-dialog.information')}
          </MessageStrip>
        )}
      </MessageBox>
      <GenericList
        title={
          showTitle ? prettifyNamePlural(resourceName, resourceType) : null
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
        pagination={{ itemsPerPage: 20, autoHide: true }}
        extraHeaderContent={extraHeaderContent}
        testid={testid}
        currentlyEditedResourceUID={currentlyEditedResourceUID}
        i18n={i18n}
      />
    </>
  );
}
