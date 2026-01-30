import {
  lazy,
  Fragment,
  createContext,
  Suspense,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { Title, ToolbarButton } from '@ui5/webcomponents-react';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
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

import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { createPortal } from 'react-dom';
import ResourceDetailsCard from './ResourceDetailsCard';
import { ResourceHealthCard } from '../ResourceHealthCard/ResourceHealthCard';
import { ResourceStatusCard } from '../ResourceStatusCard/ResourceStatusCard';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { HintButton } from '../HintButton/HintButton';
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import BannerCarousel from 'shared/components/FeatureCard/BannerCarousel';
import { ResourceCustomStatusColumns } from './ResourceCustomStatusColumns';
import { isEmpty } from 'lodash';
import { ProtectedResourceWarning } from '../ProtectedResourcesButton';
import { DeleteResourceModal } from '../DeleteResourceModal/DeleteResourceModal';

// This component is loaded after the page mounts.
// Don't try to load it on scroll. It was tested.
// It doesn't affect the lighthouse score, but it prolongs the graph waiting time.
const ResourceGraph = lazy(() => import('../ResourceGraph/ResourceGraph'));

const Injections = lazy(
  () => import('../../../components/Extensibility/ExtensibilityInjections'),
);

ResourceDetails.propTypes = {
  customColumns: CustomPropTypes.customColumnsType,
  children: PropTypes.node,
  customComponents: PropTypes.arrayOf(PropTypes.func),
  description: PropTypes.object,
  resourceUrl: PropTypes.string,
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
  disableEdit: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  disableDelete: PropTypes.bool,
  showYamlTab: PropTypes.bool,
  layoutCloseCreateUrl: PropTypes.string,
  layoutNumber: PropTypes.string,
  customHealthCards: PropTypes.arrayOf(PropTypes.func),
  showHealthCardsTitle: PropTypes.bool,
  isModule: PropTypes.bool,
  isEntireListProtected: PropTypes.bool,
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
  } = useGet(props.resourceUrl, {
    pollingInterval: 3000,
    errorTolerancy: props.isModule ? 0 : undefined,
  });
  const [disableEditState, setDisableEditState] = useState(false);

  useEffect(() => {
    const getDisableEdit = async () => {
      if (
        typeof props.disableEdit === 'function' ||
        typeof props.disableEdit?.then === 'function'
      ) {
        const isDisabled = await props.disableEdit(resource);
        setDisableEditState(isDisabled);
      } else {
        setDisableEditState(props.disableEdit);
      }
    };
    getDisableEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(resource), props.disableEdit]);

  if (loading) return <Spinner />;
  if (error && isEmpty(resource)) {
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource={prettifyNameSingular(
            props.resourceTitle,
            props.resourceType,
          )}
          layoutCloseUrl={props.layoutCloseCreateUrl}
          layoutNumber={props.layoutNumber ?? 'midColumn'}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(props.resourceTitle, props.resourceType)}
        customMessage={getErrorMessage(error)}
        layoutCloseUrl={props.layoutCloseCreateUrl}
        layoutNumber={props.layoutNumber ?? 'midColumn'}
      />
    );
  }

  return (
    <>
      {resource && (
        <Resource
          {...props}
          key={resource.metadata.name}
          resource={resource}
          disableEdit={disableEditState}
        />
      )}
    </>
  );
}

function Resource({
  customTitle,
  disableResourceDetailsCard = false,
  hideLabels = false,
  hideAnnotations = false,
  hideLastUpdate = false,
  layoutNumber = 'midColumn',
  layoutCloseCreateUrl,
  children,
  createResourceForm: CreateResourceForm,
  customColumns = [],
  customComponents = [],
  customConditionsComponents,
  description,
  editActionLabel,
  headerActions = null,
  namespace,
  readOnly = false,
  resource,
  resourceHeaderActions = [],
  resourceType,
  resourceUrl,
  title,
  windowTitle,
  resourceTitle,
  resourceGraphConfig,
  resourceSchema,
  disableEdit = false,
  showYamlTab = false,
  disableDelete = false,
  statusBadge,
  customStatusColumns,
  customStatus,
  customHealthCards,
  showHealthCardsTitle,
  statusConditions,
  headerContent,
  className,
  headerDescription,
  isEntireListProtected = false,
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
  const { isProtected, isProtectedResource } = useProtectedResources();

  const {
    showDeleteDialog,
    handleResourceDelete,
    performDelete,
    performCancel,
  } = useDeleteResource({
    resourceTitle,
    resourceType,
    navigateToListAfterDelete: true,
    layoutNumber,
  });

  const layoutColumn = useAtomValue(columnLayoutAtom);
  // Use isProtectedResource for showing the icon (always show if resource matches rules)
  const showProtectedResourceWarning =
    isProtectedResource(resource) || isEntireListProtected;
  // Use isProtected for blocking modifications (considers user setting)
  const protectedResource = isProtected(resource) || isEntireListProtected;
  const [filteredStatusColumns, setFilteredStatusColumns] = useState([]);
  const [filteredStatusColumnsLong, setFilteredStatusColumnsLong] = useState(
    [],
  );
  const [filteredConditionsComponents, setFilteredConditionsComponents] =
    useState([]);
  const [filteredDetailsCardColumns, setFilteredDetailsCardColumns] = useState(
    [],
  );

  const filterColumns = async (col) => {
    const { visible, error } = (await col.visibility?.(resource)) || {
      visible: true,
    };
    if (error) {
      col.value = () => t('common.messages.error', { error: error.message });
      return true;
    }
    return visible;
  };

  useEffect(() => {
    if (customStatusColumns?.length) {
      Promise.all(
        customStatusColumns.map(async (col) => {
          return (await filterColumns(col)) ? col : false;
        }),
      ).then((res) => {
        const customCols = res
          .filter(Boolean)
          ?.filter((col) => !col?.conditionComponent)
          ?.filter((col) => !col?.fullWidth || col?.fullWidth === false);
        setFilteredStatusColumns(customCols);

        const customColsLong = res
          .filter(Boolean)
          ?.filter((col) => !col?.conditionComponent)
          ?.filter((col) => col?.fullWidth && col?.fullWidth === true);
        setFilteredStatusColumnsLong(customColsLong);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStatusColumns]);

  useEffect(() => {
    if (customConditionsComponents?.length) {
      Promise.all(
        customConditionsComponents.map(async (col) => {
          return (await filterColumns(col)) ? col : false;
        }),
      ).then((res) => setFilteredConditionsComponents(res.filter(Boolean)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customConditionsComponents]);

  useEffect(() => {
    if (customColumns?.length) {
      Promise.all(
        customColumns.map(async (col) => {
          return (await filterColumns(col)) ? col : false;
        }),
      ).then((res) => setFilteredDetailsCardColumns(res.filter(Boolean)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customColumns]);

  const actions = readOnly ? null : (
    <>
      {headerActions}
      <Suspense fallback={<Spinner />}>
        <Injections
          destination={resourceType}
          slot="details-header"
          root={resource}
        />
      </Suspense>
      {resourceHeaderActions.map((resourceAction) => resourceAction(resource))}
      {!disableDelete && (
        <>
          <ToolbarButton
            disabled={protectedResource}
            onClick={() => handleResourceDelete({ resourceUrl })}
            design="Transparent"
            tooltip={
              protectedResource
                ? t('common.tooltips.protected-resources-info')
                : null
            }
            text={t('common.buttons.delete')}
          />
          {createPortal(
            <DeleteResourceModal
              resource={resource}
              resourceUrl={resourceUrl}
              resourceType={resource.kind}
              performDelete={performDelete}
              showDeleteDialog={showDeleteDialog}
              performCancel={performCancel}
            />,
            document.body,
          )}
          \
        </>
      )}
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );

  // https://stackoverflow.com/questions/70330862/how-to-get-the-latest-change-time-of-a-resource-instance-in-k8s
  let lastUpdate;
  const managedFields = resource.metadata?.managedFields;
  if (managedFields && Array.isArray(managedFields)) {
    const lastOp = managedFields[managedFields.length - 1];
    lastUpdate = lastOp.time;
  }

  const renderUpdateDate = (lastUpdate) => {
    if (lastUpdate) {
      return <ReadableElapsedTimeFromNow timestamp={lastUpdate} />;
    }
    return EMPTY_TEXT_PLACEHOLDER;
  };

  const resourceStatusCard = customStatus ? (
    customStatus
  ) : customStatusColumns?.length ||
    customConditionsComponents?.length ||
    statusConditions?.length ? (
    <ResourceStatusCard
      statusBadge={statusBadge ? statusBadge(resource) : null}
      customColumns={
        customStatusColumns?.length ? (
          <ResourceCustomStatusColumns
            filteredStatusColumns={filteredStatusColumns}
            resource={resource}
          />
        ) : null
      }
      customColumnsLong={
        customStatusColumns?.length ? (
          <ResourceCustomStatusColumns
            filteredStatusColumns={filteredStatusColumnsLong}
            resource={resource}
          />
        ) : null
      }
      conditions={statusConditions ? statusConditions(resource) : null}
      customConditionsComponent={
        customConditionsComponents?.length ? (
          <>
            {filteredConditionsComponents?.map((component, index) => (
              <Fragment key={`${component.header.replace(' ', '-')}-${index}`}>
                <div className="title bsl-has-color-status-4 sap-margin-x-small">
                  {component.header}:
                </div>
                {component.value(resource)}
              </Fragment>
            ))}
          </>
        ) : null
      }
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
                  className="sap-margin-begin-tiny"
                  setShowTitleDescription={setShowTitleDescription}
                  showTitleDescription={showTitleDescription}
                  description={description}
                  ariaTitle={resource?.kind}
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
            />
          </DynamicPageComponent.Column>
          {!hideLastUpdate && (
            <DynamicPageComponent.Column
              key="Last Update"
              title={t('common.headers.last-update')}
            >
              {renderUpdateDate(lastUpdate)}
            </DynamicPageComponent.Column>
          )}
          {filteredDetailsCardColumns.map((col) => (
            <DynamicPageComponent.Column key={col.header} title={col.header}>
              {col.value(resource)}
            </DynamicPageComponent.Column>
          ))}
          {!hideLabels && (
            <DynamicPageComponent.Column
              key="Labels"
              title={t('common.headers.labels')}
              columnSpan="1/1"
            >
              <Labels
                labels={resource.metadata.labels || {}}
                shortenLongLabels
              />
            </DynamicPageComponent.Column>
          )}
          {!hideAnnotations && (
            <DynamicPageComponent.Column
              key="Annotations"
              title={t('common.headers.annotations')}
            >
              <Labels
                labels={resource.metadata.annotations || {}}
                shortenLongLabels
              />
            </DynamicPageComponent.Column>
          )}
        </>
      }
    />
  );

  const customOverviewCard = (customHealthCards || []).map(
    (healthCard, index) => healthCard(resource, index),
  );

  return (
    <ResourceDetailContext.Provider value={true}>
      <DynamicPageComponent
        className={className}
        headerContent={headerContent}
        showYamlTab={showYamlTab || disableEdit}
        layoutNumber={layoutNumber ?? 'midColumn'}
        layoutCloseUrl={layoutCloseCreateUrl}
        title={customTitle ?? resource.metadata.name}
        description={headerDescription}
        actions={actions}
        protectedResource={showProtectedResourceWarning}
        protectedResourceWarning={
          <ProtectedResourceWarning entry={resource} withText />
        }
        content={
          <>
            <BannerCarousel>
              <Injections
                destination={resourceType}
                slot="banner"
                root={resource}
              />
            </BannerCarousel>
            {!disableResourceDetailsCard && (
              <section aria-labelledby="namespace-details-heading">
                <Title
                  level="H3"
                  size="H3"
                  className="sap-margin-top-small sap-margin-bottom-medium"
                  id="namespace-details-heading"
                >
                  {title ?? t('common.headers.resource-details')}
                </Title>
                <div
                  className={`resource-details-container ${
                    layoutColumn.layout === 'MidColumnFullScreen' ||
                    layoutColumn.layout === 'EndColumnFullScreen' ||
                    layoutColumn.layout === 'OneColumn'
                      ? ''
                      : 'column-view'
                  }`}
                >
                  {resourceDetailsCard}
                  {resourceStatusCard && resourceStatusCard}
                </div>
                <ResourceHealthCard
                  customHealthCards={customOverviewCard}
                  showHealthCardsTitle={showHealthCardsTitle}
                />
              </section>
            )}
            <Suspense fallback={<Spinner />}>
              <Injections
                destination={resourceType}
                slot="details-top"
                root={resource}
              />
            </Suspense>
            {(customComponents || []).map((component) =>
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
        inlineEditForm={(stickyHeaderHeight) => (
          <ResourceCreate
            title={
              editActionLabel ||
              t('components.resource-details.edit', {
                resourceType: prettifiedResourceKind,
              })
            }
            isEdit={true}
            confirmText={t('common.buttons.save')}
            protectedResource={showProtectedResourceWarning}
            protectedResourceWarning={
              <ProtectedResourceWarning entry={resource} withText />
            }
            isProtectedResourceModificationBlocked={protectedResource}
            readOnly={readOnly}
            disableEdit={disableEdit}
            renderForm={(props) => (
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
