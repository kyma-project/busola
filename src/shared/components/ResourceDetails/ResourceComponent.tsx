import { lazy, Suspense, useEffect, useState } from 'react';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { Title } from '@ui5/webcomponents-react';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { useVersionWarning } from 'hooks/useVersionWarning';
import { ResourceHealthCard } from '../ResourceHealthCard/ResourceHealthCard';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import BannerCarousel from 'shared/components/FeatureCard/BannerCarousel';
import { CustomColumn } from './ResourceCustomStatusColumns';
import { ProtectedResourceWarning } from '../ProtectedResourcesButton';
import { ResourceDetailContext, ResourceDetailsProps } from './ResourceDetails';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { ResourceActions } from './ResourceActions';
import { ResourceDetailsCardContent } from './ResourceDetailsCardContent';
import { ResourceStatusCardContent } from './ResourceStatusCardContent';
import './ResourceDetailsCard.scss';

// This component is loaded after the page mounts.
// Don't try to load it on scroll. It was tested.
// It doesn't affect the lighthouse score, but it prolongs the graph waiting time.
const ResourceGraph = lazy(() => import('../ResourceGraph/ResourceGraph'));

const Injections = lazy(
  () => import('../../../components/Extensibility/ExtensibilityInjections'),
);

type ResourceProps = Omit<ResourceDetailsProps, 'disableEdit'> & {
  resource: K8sResource & Resource;
  disableEdit?: boolean;
};

export function ResourceComponent({
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
  resourceUrl = '',
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
}: ResourceProps) {
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
    /*@ts-expect-error Type mismatch between js and ts*/
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
  const [filteredStatusColumns, setFilteredStatusColumns] = useState<
    CustomColumn[]
  >([]);
  const [filteredStatusColumnsLong, setFilteredStatusColumnsLong] = useState<
    CustomColumn[]
  >([]);
  const [filteredConditionsComponents, setFilteredConditionsComponents] =
    useState<CustomColumn[]>([]);
  const [filteredDetailsCardColumns, setFilteredDetailsCardColumns] = useState<
    CustomColumn[]
  >([]);

  const filterColumns = async (col: CustomColumn) => {
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
          return (await filterColumns(col)) ? col : null;
        }),
      ).then((res) => {
        const customCols = res
          .filter(Boolean)
          ?.filter((col) => !col?.conditionComponent)
          ?.filter((col) => !col?.fullWidth);
        setFilteredStatusColumns(customCols as CustomColumn[]);

        const customColsLong = res
          .filter(Boolean)
          ?.filter((col) => !col?.conditionComponent)
          ?.filter((col) => col?.fullWidth && col?.fullWidth === true);
        setFilteredStatusColumnsLong(customColsLong as CustomColumn[]);
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
      ).then((res) =>
        setFilteredConditionsComponents(res.filter(Boolean) as CustomColumn[]),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customConditionsComponents]);

  useEffect(() => {
    if (customColumns?.length) {
      Promise.all(
        customColumns.map(async (col) => {
          return (await filterColumns(col)) ? col : false;
        }),
      ).then((res) =>
        setFilteredDetailsCardColumns(res.filter(Boolean) as CustomColumn[]),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customColumns]);

  let lastUpdate;
  const managedFields = resource.metadata?.managedFields;
  if (managedFields && Array.isArray(managedFields)) {
    const latestEntry = managedFields.reduce((latest, current) => {
      if (!current.time) return latest;
      if (!latest || !latest.time) return current;
      return new Date(current.time) > new Date(latest.time) ? current : latest;
    }, null);

    lastUpdate = latestEntry?.time;
  }

  const renderUpdateDate = (lastUpdate: string) => {
    if (lastUpdate) {
      return <ReadableElapsedTimeFromNow timestamp={lastUpdate} />;
    }
    return EMPTY_TEXT_PLACEHOLDER;
  };

  const customOverviewCard = (customHealthCards || []).map(
    (healthCard, index) => healthCard(resource, index),
  );

  return (
    <ResourceDetailContext.Provider value={true}>
      {/*@ts-expect-error Type mismatch between js and ts*/}
      <DynamicPageComponent
        className={className}
        headerContent={headerContent}
        showYamlTab={showYamlTab || disableEdit}
        layoutNumber={layoutNumber ?? 'midColumn'}
        layoutCloseUrl={layoutCloseCreateUrl}
        title={customTitle ?? resource.metadata.name}
        description={headerDescription}
        actions={
          <ResourceActions
            headerActions={headerActions}
            readOnly={readOnly}
            resource={resource}
            resourceHeaderActions={resourceHeaderActions}
            resourceType={resourceType}
            resourceUrl={resourceUrl}
            disableDelete={disableDelete}
            handleResourceDelete={handleResourceDelete}
            protectedResource={protectedResource}
            performDelete={performDelete}
            showDeleteDialog={showDeleteDialog}
            performCancel={performCancel}
          />
        }
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
                  <ResourceDetailsCardContent
                    resource={resource}
                    description={description}
                    setShowTitleDescription={setShowTitleDescription}
                    showTitleDescription={showTitleDescription}
                    lastUpdate={lastUpdate}
                    renderUpdateDate={renderUpdateDate}
                    filteredDetailsCardColumns={filteredDetailsCardColumns}
                    hideLastUpdate={hideLastUpdate}
                    hideLabels={hideLabels}
                    hideAnnotations={hideAnnotations}
                  />
                  <ResourceStatusCardContent
                    resource={resource}
                    statusBadge={statusBadge}
                    customStatus={customStatus}
                    customStatusColumns={customStatusColumns}
                    filteredStatusColumns={filteredStatusColumns}
                    filteredStatusColumnsLong={filteredStatusColumnsLong}
                    statusConditions={statusConditions}
                    customConditionsComponents={customConditionsComponents}
                    filteredConditionsComponents={filteredConditionsComponents}
                  />
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
            {resource.kind && resourceGraphConfig?.[resource.kind] && (
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
        inlineEditForm={(stickyHeaderHeight: number | string) => (
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
            /*@ts-expect-error Type mismatch between js and ts*/
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
