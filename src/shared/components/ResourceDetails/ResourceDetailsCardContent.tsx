import { useTranslation } from 'react-i18next';
import ResourceDetailsCard from './ResourceDetailsCard';
import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';
import { HintButton } from '../HintButton/HintButton';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { Labels } from 'shared/components/Labels/Labels';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { Dispatch, JSX, ReactNode, SetStateAction } from 'react';
import { CustomColumn } from './ResourceCustomStatusColumns';
import { FormGroup, FormItem, Label } from '@ui5/webcomponents-react';

type ResourceDetailsCardContentProps = {
  resource: K8sResource & Resource;
  description?: ReactNode;
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
      content={
        <>
          <FormGroup>
            <FormItem
              key="Resource Type"
              labelContent={
                <Label showColon>{t('common.headers.resource-type')}</Label>
              }
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
            </FormItem>
            <FormItem
              key="Age"
              labelContent={<Label showColon>{t('common.headers.age')}</Label>}
            >
              <div>
                <ReadableElapsedTimeFromNow
                  timestamp={resource.metadata.creationTimestamp}
                />
              </div>
            </FormItem>
            {!hideLabels && (
              <FormItem
                key="Labels"
                labelContent={
                  <Label showColon>{t('common.headers.labels')}</Label>
                }
              >
                <Labels
                  labels={resource.metadata.labels || {}}
                  shortenLongLabels
                />
              </FormItem>
            )}
            {!hideLastUpdate && (
              <FormItem
                key="Last Update"
                labelContent={
                  <Label showColon>{t('common.headers.last-update')}</Label>
                }
              >
                <div>{renderUpdateDate(lastUpdate)}</div>
              </FormItem>
            )}

            {filteredDetailsCardColumns.map((col) => (
              <FormItem
                key={col.header}
                labelContent={<Label showColon>{col.header ?? ''}</Label>}
              >
                {col.value(resource)}
              </FormItem>
            ))}

            {!hideAnnotations && (
              <FormItem
                key="Annotations"
                labelContent={
                  <Label showColon>{t('common.headers.annotations')}</Label>
                }
              >
                <Labels
                  labels={resource.metadata.annotations || {}}
                  shortenLongLabels
                />
              </FormItem>
            )}
          </FormGroup>
        </>
      }
    />
  );
};
