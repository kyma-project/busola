import { prettifyNamePlural } from 'shared/utils/helpers';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import BannerCarousel from 'shared/components/FeatureCard/BannerCarousel';
import { useGetInjections } from 'components/Extensibility/useGetInjection';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';
import { Resources } from './Resources';
import { ResourcesListProps } from './types';
import { ResourceListRenderer } from './ResourceListRenderer';

const Injections = lazyWithRetries(
  () => import('../../../components/Extensibility/ExtensibilityInjections'),
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

export function ResourcesList({
  customHeaderActions = null,
  resourceUrl,
  resourceType,
  resourceTitle,
  isCompact,
  description,
  layoutNumber = 'startColumn',
  resources,
  filterFn = () => true,
  ...props
}: ResourcesListProps) {
  const headerInjections = useGetInjections(resourceType, 'list-header');
  if (!resourceUrl) {
    return <></>; // wait for the context update
  }

  const allProps = {
    customHeaderActions,
    resourceUrl,
    resourceType,
    resourceTitle,
    isCompact,
    description,
    layoutNumber,
    resources,
    filterFn,
    ...props,
  };

  const content = (
    <>
      <BannerCarousel>
        <Injections destination={resourceType} slot="banner" root={resources} />
      </BannerCarousel>
      {resources ? (
        <ResourceListRenderer
          {...allProps}
          resources={(resources || []).filter(filterFn)}
        />
      ) : (
        <Resources {...allProps} />
      )}
    </>
  );

  const headerActions = headerInjections.length ? (
    <>
      <Injections
        destination={resourceType}
        slot="list-header"
        root={resources}
      />
      {customHeaderActions}
    </>
  ) : (
    customHeaderActions
  );

  return (
    <>
      {!isCompact ? (
        <DynamicPageComponent
          layoutNumber={layoutNumber}
          title={prettifyNamePlural(resourceTitle, resourceType)}
          actions={headerActions}
          description={description}
          content={content}
        />
      ) : (
        content
      )}
    </>
  );
}
