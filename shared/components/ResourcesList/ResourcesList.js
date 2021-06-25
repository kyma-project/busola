import React from 'react';
import PropTypes from 'prop-types';
import jsyaml from 'js-yaml';
import { Link, Button } from 'fundamental-react';
import { createPatch } from 'rfc6902';

import './ResourcesList.scss';
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
import { useWindowTitle } from '../../hooks';

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
    <YamlEditorProvider>
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
}) {
  useWindowTitle(windowTitle || prettifyNamePlural(resourceName, resourceType));
  const { setEditedYaml: setEditedSpec, closeEditor } = useYamlEditor();
  const notification = useNotification();
  const updateResourceMutation = useUpdate(resourceUrl);
  const deleteResourceMutation = useDelete(resourceUrl);
  const { loading = true, error, data: resources, silentRefetch } = useGetList(
    filter,
  )(resourceUrl, { pollingInterval: 3000, skip: skipDataLoading });

  React.useEffect(() => closeEditor(), [namespace]);

  const prettifiedResourceName = prettifyNameSingular(
    resourceName,
    resourceType,
  );

  const handleSaveClick = resourceData => async newYAML => {
    try {
      const diff = createPatch(resourceData, jsyaml.safeLoad(newYAML));
      const url = resourceUrl + '/' + resourceData.metadata.name;
      await updateResourceMutation(url, diff);
      silentRefetch();
      notification.notifySuccess({
        content: `${prettifiedResourceName} updated`,
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: `Failed to update the ${prettifiedResourceName}`,
        content: e.message,
      });
      throw e;
    }
  };

  async function handleResourceDelete(resource) {
    const url = resourceUrl + '/' + resource.metadata.name;
    try {
      await deleteResourceMutation(url);
      notification.notifySuccess({
        content: `${prettifiedResourceName} deleted`,
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: `Failed to delete the ${prettifiedResourceName}`,
        content: e.message,
      });
      throw e;
    }
  }

  const actions = readOnly
    ? []
    : [
        {
          name: 'Edit',
          handler: resource => {
            const { status, ...otherResourceData } = resource; // remove 'status' property because you can't edit it anyway; TODO: decide if it's good
            setEditedSpec(
              otherResourceData,
              handleSaveClick(otherResourceData),
            );
          },
        },
        {
          name: 'Delete',
          handler: handleResourceDelete,
        },
      ];

  const headerRenderer = () => [
    'Name',
    'Created',
    'Labels',
    ...customColumns.map(col => col.header),
  ];

  const rowRenderer = entry => [
    hasDetailsView ? (
      <Link
        className="link"
        onClick={_ =>
          navigateFn
            ? navigateFn(entry.metadata.name)
            : fixedPath
            ? navigateToFixedPathResourceDetails(
                resourceType,
                entry.metadata.name,
              )
            : navigateToDetails(resourceType, entry.metadata.name)
        }
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
        title={`Create ${prettifiedResourceName}`}
        modalOpeningComponent={
          <Button glyph="add" option="transparent">
            Create {prettifiedResourceName}
          </Button>
        }
        confirmText="Create"
        id={`add-${resourceType}-modal`}
        className="fd-dialog--xl-size modal-width--m"
        renderForm={props => (
          <CreateResourceForm
            resourceType={resourceType}
            resourceUrl={resourceUrl}
            namespace={namespace}
            refetchList={silentRefetch}
            {...props}
          />
        )}
      />
    ));

  return (
    <GenericList
      title={showTitle ? prettifyNamePlural(resourceName, resourceType) : null}
      textSearchProperties={['metadata.name']}
      actions={actions}
      entries={resources || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
      pagination={{ itemsPerPage: 20, autoHide: true }}
      extraHeaderContent={extraHeaderContent}
      testid={testid}
    />
  );
}
