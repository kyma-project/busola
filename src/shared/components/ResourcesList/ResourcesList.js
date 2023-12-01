import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import { Link } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import * as jp from 'jsonpath';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { YamlEditorProvider } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { prettifyNameSingular, prettifyNamePlural } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { nameLocaleSort, timeSort } from '../../helpers/sortingfunctions';
import { useVersionWarning } from 'hooks/useVersionWarning';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { useRecoilState } from 'recoil';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';
import { createPortal } from 'react-dom';

const Injections = React.lazy(() =>
  import('../../../components/Extensibility/ExtensibilityInjections'),
);

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
  isCompact: PropTypes.bool,
  showTitle: PropTypes.bool,
  filter: PropTypes.func,
  listHeaderActions: PropTypes.node,
  description: PropTypes.node,
  readOnly: PropTypes.bool,
  customUrl: PropTypes.string,
  testid: PropTypes.string,
  omitColumnsIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  resourceUrlPrefix: PropTypes.string,
  disableCreate: PropTypes.bool,
  disableEdit: PropTypes.bool,
  disableDelete: PropTypes.bool,
  disableMargin: PropTypes.bool,
};

ResourcesList.defaultProps = {
  customHeaderActions: null,
  customColumns: [],
  createResourceForm: null,
  showTitle: false,
  listHeaderActions: null,
  readOnly: false,
  disableCreate: false,
  disableEdit: false,
  disableDelete: false,
  disableMargin: false,
  filterFn: () => true,
};

export function ResourcesList(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  }

  const content = props.resources ? (
    <ResourceListRenderer
      resources={(props.resources || []).filter(props.filterFn)}
      {...props}
    />
  ) : (
    <Resources {...props} />
  );

  return (
    <YamlEditorProvider>
      {!props.isCompact ? (
        <DynamicPageComponent
          title={prettifyNamePlural(props.resourceTitle, props.resourceType)}
          actions={
            <>
              <Injections
                destination={props.resourceType}
                slot="list-header"
                root={props.resources}
              />
              {props.customHeaderActions}
            </>
          }
          description={props.description}
          content={content}
        />
      ) : (
        content
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
  title,
  showTitle,
  listHeaderActions,
  readOnly,
  customUrl,
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
  disableEdit,
  disableDelete,
  disableMargin,
  sortBy = {
    name: nameLocaleSort,
    time: timeSort,
  },
  searchSettings,
  isCompact,
}) {
  const [showAdd, setShowAdd] = useRecoilState(showYamlUploadDialogState);
  useVersionWarning({
    resourceUrl,
    resourceType,
  });
  const { t } = useTranslation();
  const { protectedResourceWarning } = useProtectedResources();

  const [toggleFormFn, getToggleFormFn] = useState(() => {});

  const [activeResource, setActiveResource] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { resourceUrl: resourceUrlFn } = useUrl();

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const linkTo = entry =>
    customUrl ? customUrl(entry) : resourceUrlFn(entry, { resourceType });

  const defaultColumns = [
    {
      header: t('common.headers.name'),
      value: entry =>
        hasDetailsView ? (
          <Link
            className="bsl-link"
            style={{ fontWeight: 'bold' }}
            to={linkTo(entry)}
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

  const isNamespaceAll = namespace === '-all-';
  if (isNamespaceAll) {
    omitColumnsIds = omitColumnsIds.filter(id => id !== 'namespace');
  }

  customColumns =
    columns ||
    [...defaultColumns, ...customColumns].filter(
      col => !omitColumnsIds.includes(col.id),
    );

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
        ...customListActions,
      ].filter(e => e);

  const nameColIndex = customColumns.findIndex(col => col.id === 'name');

  const headerRenderer = () => {
    const rowColumns = customColumns.map(col => col.header || null);
    rowColumns.splice(nameColIndex + 1, 0, '');
    return rowColumns;
  };

  const rowRenderer = entry => {
    const rowColumns = customColumns.map(col =>
      col.value ? col.value(entry) : null,
    );
    rowColumns.splice(nameColIndex + 1, 0, protectedResourceWarning(entry));
    return rowColumns;
  };

  const extraHeaderContent = listHeaderActions || [
    CreateResourceForm && !disableCreate && !isNamespaceAll && (
      <Button
        icon="add"
        design="Transparent"
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

  const textSearchProperties = () => {
    const defaultSearchProperties = ['metadata.name', 'metadata.labels'];

    if (typeof searchSettings?.textSearchProperties === 'function')
      return searchSettings.textSearchProperties(defaultSearchProperties);

    return [
      ...defaultSearchProperties,
      ...(searchSettings?.textSearchProperties || []),
    ];
  };

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
        className="modal-size--l"
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
      {!(error && error.toString().includes('is forbidden')) && (
        <GenericList
          disableMargin={disableMargin}
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
          sortBy={sortBy}
          searchSettings={{
            ...searchSettings,
            textSearchProperties: textSearchProperties(),
          }}
        />
      )}
      {!isCompact &&
        createPortal(
          <YamlUploadDialog
            open={showAdd}
            onCancel={() => {
              setShowAdd(false);
            }}
          />,
          document.body,
        )}
    </>
  );
}
