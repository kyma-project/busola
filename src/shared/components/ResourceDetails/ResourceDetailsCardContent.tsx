import { useTranslation } from 'react-i18next';
import ResourceDetailsCard from './ResourceDetailsCard';
import { HintButton } from '../HintButton/HintButton';
import { ReadableElapsedTimeFromNow } from '../ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { Labels } from 'shared/components/Labels/Labels';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { Dispatch, JSX, ReactNode, SetStateAction } from 'react';
import { CustomColumn } from './ResourceCustomStatusColumns';
import { FormItem, Label, Text } from '@ui5/webcomponents-react';

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

  const totalItems =
    2 + // Resource Type + Age always present
    (!hideLastUpdate ? 1 : 0) +
    filteredDetailsCardColumns.length +
    (!hideLabels ? 1 : 0) +
    (!hideAnnotations ? 1 : 0);
  const needsPadding = !hideLabels && !hideAnnotations && totalItems % 2 !== 0;

  return (
    <ResourceDetailsCard
      titleText={t('cluster-overview.headers.metadata')}
      content={
        <>
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
            <Text>
              <ReadableElapsedTimeFromNow
                timestamp={resource.metadata.creationTimestamp}
              />
            </Text>
          </FormItem>
          {!hideLastUpdate && (
            <FormItem
              key="Last Update"
              labelContent={
                <Label showColon>{t('common.headers.last-update')}</Label>
              }
            >
              <Text>{renderUpdateDate(lastUpdate)}</Text>
            </FormItem>
          )}
          {filteredDetailsCardColumns.map((col) => (
            <FormItem
              key={col.header}
              labelContent={<Label showColon>{col.header ?? ''}</Label>}
            >
              <div>{col.value(resource)}</div>
            </FormItem>
          ))}
          {needsPadding && (
            <FormItem key="padding" labelContent={<Label />}>
              <span />
            </FormItem>
          )}
          {!hideLabels && (
            <FormItem
              className="card-labels"
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
        </>
      }
    />
  );
};
