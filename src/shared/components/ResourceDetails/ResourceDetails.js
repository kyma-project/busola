import React, { createContext, Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { Button, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useDelete, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { YamlEditorProvider } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { getErrorMessage, prettifyNameSingular } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { Spinner } from 'shared/components/Spinner/Spinner';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { useVersionWarning } from 'hooks/useVersionWarning';

import { Tooltip } from '../Tooltip/Tooltip';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { createPortal } from 'react-dom';
import ResourceDetailsCard from './ResourceDetailsCard';
import { ResourceStatusCard } from '../ResourceStatusCard/ResourceStatusCard';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { HintButton } from '../DescriptionHint/DescriptionHint';
import { useRecoilValue } from 'recoil';
import { useFeature } from 'hooks/useFeature';
import { columnLayoutState } from 'state/columnLayoutAtom';
import BannerCarousel from 'components/Extensibility/components/FeaturedCard/BannerCarousel';

// This component is loaded after the page mounts.
// Don't try to load it on scroll. It was tested.
// It doesn't affect the lighthouse score, but it prolongs the graph waiting time.
const ResourceGraph = React.lazy(() =>
  import('../ResourceGraph/ResourceGraph'),
);

const Injections = React.lazy(() =>
  import('../../../components/Extensibility/ExtensibilityInjections'),
);

ResourceDetails.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  children: PropTypes.node,
  customComponents: PropTypes.arrayOf(PropTypes.func),
  description: PropTypes.object,
  resourceUrl: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  resourceName: PropTypes.string,
  resourceTitle: PropTypes.string,
  namespace: PropTypes.string,
  headerActions: PropTypes.node,
  resourceHeaderActions: PropTypes.arrayOf(PropTypes.func),
  readOnly: PropTypes.bool,
  editActionLabel: PropTypes.string,
  windowTitle: PropTypes.string,
  resourceGraphConfig: PropTypes.object,
  resourceSchema: PropTypes.object,
  disableEdit: PropTypes.bool,
  disableDelete: PropTypes.bool,
  showYamlTab: PropTypes.bool,
  layoutCloseCreateUrl: PropTypes.string,
  layoutNumber: PropTypes.string,
  customOverviewCard: PropTypes.node,
};

ResourceDetails.defaultProps = {
  customColumns: [],
  customComponents: [],
  headerActions: null,
  resourceHeaderActions: [],
  readOnly: false,
  disableEdit: false,
  disableDelete: false,
  showYamlTab: false,
  layoutNumber: 'MidColumn',
};

export function ResourceDetails(props) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  } else {
    return <ResourceDetailsRenderer {...props} />;
  }
}

export const ResourceDetailContext = createContext(false);

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
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource={prettifyNameSingular(
            props.resourceTitle,
            props.resourceType,
          )}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(props.resourceTitle, props.resourceType)}
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
  customTitle,
  disableResourceDetailsCard = false,
  layoutNumber,
  layoutCloseCreateUrl,
  children,
  createResourceForm: CreateResourceForm,
  customColumns,
  customComponents,
  description,
  editActionLabel,
  headerActions,
  namespace,
  readOnly,
  resource,
  resourceHeaderActions,
  resourceType,
  resourceUrl,
  title,
  windowTitle,
  resourceTitle,
  resourceGraphConfig,
  resourceSchema,
  disableEdit,
  showYamlTab,
  disableDelete,
  statusBadge,
  customStatusColumns,
  customOverview,
  statusConditions,
  headerContent,
}) {
  useVersionWarning({ resourceUrl, resourceType });
  const { t } = useTranslation();
  const prettifiedResourceKind = prettifyNameSingular(
    resourceTitle,
    resource.kind,
  );
  const [showTitleDescription, setShowTitleDescription] = useState(false);

  const pluralizedResourceKind = pluralize(prettifiedResourceKind);
  useWindowTitle(windowTitle || pluralizedResourceKind);
  const { isProtected, protectedResourceWarning } = useProtectedResources();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceTitle,
    resourceType,
    navigateToListAfterDelete: true,
    layoutNumber,
  });

  const layoutColumn = useRecoilValue(columnLayoutState);
  const { isEnabled: isColumnLayoutEnabled } = useFeature('COLUMN_LAYOUT');

  const protectedResource = isProtected(resource);

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
      <Suspense fallback={<Spinner />}>
        <BannerCarousel
          children={
            <Injections
              destination={resourceType}
              slot="banner"
              root={resource}
            />
          }
        />
        <Injections
          destination={resourceType}
          slot="details-header"
          root={resource}
        />
      </Suspense>
      {headerActions}
      {resourceHeaderActions.map(resourceAction => resourceAction(resource))}
      {deleteButtonWrapper(
        <Button
          disabled={protectedResource || disableDelete}
          onClick={() => handleResourceDelete({ resourceUrl })}
          design="Transparent"
        >
          {t('common.buttons.delete')}
        </Button>,
      )}
      {createPortal(
        <DeleteMessageBox resource={resource} resourceUrl={resourceUrl} />,
        document.body,
      )}
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );

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

  // https://stackoverflow.com/questions/70330862/how-to-get-the-latest-change-time-of-a-resource-instance-in-k8s
  let lastUpdate;
  const managedFields = resource.metadata?.managedFields;
  if (managedFields && Array.isArray(managedFields)) {
    const lastOp = managedFields[managedFields.length - 1];
    lastUpdate = lastOp.time;
  }

  const renderUpdateDate = (lastUpdate, valueUnit) => {
    if (lastUpdate) {
      return (
        <ReadableElapsedTimeFromNow
          timestamp={lastUpdate}
          valueUnit={valueUnit}
        />
      );
    }
    return EMPTY_TEXT_PLACEHOLDER;
  };

  const resourceStatusCard = customStatusColumns ? (
    <ResourceStatusCard
      statusBadge={statusBadge ? statusBadge(resource) : null}
      customColumns={
        <>
          {customStatusColumns?.filter(filterColumns)?.map(col => (
            <DynamicPageComponent.Column key={col.header} title={col.header}>
              {col.value(resource)}
            </DynamicPageComponent.Column>
          ))}
        </>
      }
      conditions={statusConditions ? statusConditions(resource) : null}
    />
  ) : null;

  const resourceDetailsCard = (
    <ResourceDetailsCard
      titleText={t('cluster-overview.headers.metadata')}
      wrapperClassname="resource-overview__details-wrapper"
      content={
        <>
          <DynamicPageComponent.Column
            key="Resource Type"
            title={t('common.headers.resource-type')}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {resource.kind}
              {description && (
                <HintButton
                  style={spacing.sapUiTinyMarginBegin}
                  setShowTitleDescription={setShowTitleDescription}
                  showTitleDescription={showTitleDescription}
                  description={description}
                  context="details"
                />
              )}
            </div>
          </DynamicPageComponent.Column>

          <DynamicPageComponent.Column
            key="Age"
            title={t('common.headers.age')}
          >
            <ReadableElapsedTimeFromNow
              timestamp={resource.metadata.creationTimestamp}
              valueUnit={t('common.value-units.days')}
            />
          </DynamicPageComponent.Column>

          <DynamicPageComponent.Column
            key="Last Update"
            title={t('common.headers.last-update')}
          >
            {renderUpdateDate(lastUpdate, t('common.value-units.days-ago'))}
          </DynamicPageComponent.Column>

          {customColumns.filter(filterColumns).map(col => (
            <DynamicPageComponent.Column key={col.header} title={col.header}>
              {col.value(resource)}
            </DynamicPageComponent.Column>
          ))}
          <DynamicPageComponent.Column
            key="Labels"
            title={t('common.headers.labels')}
            columnSpan="1/1"
          >
            <Labels labels={resource.metadata.labels || {}} shortenLongLabels />
          </DynamicPageComponent.Column>

          <DynamicPageComponent.Column
            key="Annotations"
            title={t('common.headers.annotations')}
          >
            <Labels
              labels={resource.metadata.annotations || {}}
              shortenLongLabels
            />
          </DynamicPageComponent.Column>
        </>
      }
    />
  );

  const customOverviewCard = customOverview && customOverview(resource);

  return (
    <ResourceDetailContext.Provider value={true}>
      <DynamicPageComponent
        headerContent={headerContent}
        showYamlTab={showYamlTab || disableEdit}
        layoutNumber={layoutNumber ?? 'MidColumn'}
        layoutCloseUrl={layoutCloseCreateUrl}
        title={customTitle ?? resource.metadata.name}
        actions={actions}
        protectedResource={protectedResource}
        protectedResourceWarning={protectedResourceWarning(resource)}
        content={
          <>
            {!disableResourceDetailsCard && (
              <>
                <Title
                  level="H3"
                  style={{
                    ...spacing.sapUiMediumMarginBegin,
                    ...spacing.sapUiMediumMarginTopBottom,
                  }}
                >
                  {title ?? t('common.headers.resource-details')}
                </Title>
                <div
                  className={`resource-details-container ${
                    isColumnLayoutEnabled &&
                    (layoutColumn.layout === 'MidColumnFullScreen' ||
                      layoutColumn.layout === 'EndColumnFullScreen' ||
                      layoutColumn.layout === 'OneColumn')
                      ? ''
                      : 'column-view'
                  }`}
                >
                  {resourceDetailsCard}
                  {resourceStatusCard && resourceStatusCard}
                </div>
                <div className="flexwrap" style={spacing.sapUiSmallMargin}>
                  {customOverviewCard && customOverviewCard}
                </div>
              </>
            )}
            <Suspense fallback={<Spinner />}>
              <Injections
                destination={resourceType}
                slot="details-top"
                root={resource}
              />
            </Suspense>
            {(customComponents || []).map(component =>
              component(resource, resourceUrl),
            )}
            {children}
            {resourceGraphConfig?.[resource.kind] && (
              <Suspense fallback={<Spinner />}>
                <ResourceGraph
                  resource={resource}
                  config={resourceGraphConfig}
                />
              </Suspense>
            )}
            <Suspense fallback={<Spinner />}>
              <Injections
                destination={resourceType}
                slot="details-bottom"
                root={resource}
              />
            </Suspense>
          </>
        }
        inlineEditForm={stickyHeaderHeight => (
          <ResourceCreate
            title={
              editActionLabel ||
              t('components.resource-details.edit', {
                resourceType: prettifiedResourceKind,
              })
            }
            isEdit={true}
            confirmText={t('common.buttons.save')}
            protectedResource={protectedResource}
            protectedResourceWarning={protectedResourceWarning(resource, true)}
            readOnly={readOnly}
            disableEdit={disableEdit}
            renderForm={props => (
              <ErrorBoundary>
                <CreateResourceForm
                  resource={resource}
                  resourceType={resourceType}
                  resourceUrl={resourceUrl}
                  namespace={namespace}
                  resourceSchema={resourceSchema}
                  editMode={true}
                  stickyHeaderHeight={stickyHeaderHeight}
                  {...props}
                />
              </ErrorBoundary>
            )}
          />
        )}
      ></DynamicPageComponent>
    </ResourceDetailContext.Provider>
  );
}
