import { useTranslation } from 'react-i18next';
import ResourceDetailsCard from './ResourceDetailsCard';
import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';
import { HintButton } from '../HintButton/HintButton';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { Labels } from 'shared/components/Labels/Labels';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { Dispatch, SetStateAction } from 'react';
import { CustomColumn } from './ResourceCustomStatusColumns';

type ResourceDetailsCardContentProps = {
  resource: K8sResource & Resource;
  description?: string;
  setShowTitleDescription: Dispatch<SetStateAction<boolean>>;
  showTitleDescription: boolean;
  lastUpdate: string;
  renderUpdateDate: (lastUpdate: string) => JSX.Element | string;
  filteredDetailsCardColumns: CustomColumn[];
  hideLastUpdate?: boolean;
  hideLabels?: boolean;
  hideAnnotations?: boolean;
};

export const ResourceDetailsCardContent = ({
  resource,
  description,
  setShowTitleDescription,
  showTitleDescription,
  lastUpdate,
  renderUpdateDate,
  filteredDetailsCardColumns,
  hideLastUpdate,
  hideLabels,
  hideAnnotations,
}: ResourceDetailsCardContentProps) => {
  const { t } = useTranslation();

  return (
    <ResourceDetailsCard
      titleText={t('cluster-overview.headers.metadata')}
      wrapperClassname="resource-overview__details-wrapper"
      content={
        <>
          {/*@ts-expect-error Type mismatch between js and ts*/}
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
          {/*@ts-expect-error Type mismatch between js and ts*/}
          <DynamicPageComponent.Column
            key="Age"
            title={t('common.headers.age')}
          >
            <ReadableElapsedTimeFromNow
              timestamp={resource.metadata.creationTimestamp}
            />
          </DynamicPageComponent.Column>
          {!hideLastUpdate && (
            /*@ts-expect-error Type mismatch between js and ts*/
            <DynamicPageComponent.Column
              key="Last Update"
              title={t('common.headers.last-update')}
            >
              {renderUpdateDate(lastUpdate)}
            </DynamicPageComponent.Column>
          )}
          {filteredDetailsCardColumns.map((col) => (
            /*@ts-expect-error Type mismatch between js and ts*/
            <DynamicPageComponent.Column key={col.header} title={col.header}>
              {col.value(resource)}
            </DynamicPageComponent.Column>
          ))}
          {!hideLabels && (
            /*@ts-expect-error Type mismatch between js and ts*/
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
            /*@ts-expect-error Type mismatch between js and ts*/
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
};
