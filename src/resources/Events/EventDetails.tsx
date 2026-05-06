import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';

import { FormatInvolvedObject, FormatSourceObject } from 'hooks/useMessageList';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { ResourceDescription } from 'resources/Events';
import EventCreate from './EventYaml';
import { Link } from 'shared/components/Link/Link';

type RowComponentProps = {
  name: string;
  value: any;
};

type EventDetailsProps = {
  resourceName: string;
  resourceType: string;
  resourceUrl: string;
  i18n: any;
  layoutCloseCreateUrl: string;
  namespace: string;
  readOnly: boolean;
  resourceGraphConfig: Record<string, any>;
  resourceTitle: string;
  showYamlTab?: boolean;
  [key: string]: any;
};

export const RowComponent = ({ name, value }: RowComponentProps) =>
  value ? <LayoutPanelRow name={name} value={value} /> : null;

export const Specification = (event: any) => {
  const { t } = useTranslation();
  console.log('event', event);
  return (
    <UI5Card
      title={t('common.headers.configuration')}
      accessibleName={t('common.accessible-name.configuration')}
      keyComponent="configuration"
    >
      <RowComponent
        name={t('events.headers.type')}
        value={
          <Text style={{ display: 'flex', alignItems: 'center' }}>
            {event.type}{' '}
            {event.type === 'Warning' ? (
              <ObjectStatus
                aria-label="Warning"
                icon={<Icon accessibleName="Warning" name="warning" />}
                className="sap-margin-begin-tiny"
                state="Critical"
                title={event.type}
              />
            ) : (
              <ObjectStatus
                aria-label="Normal"
                icon={<Icon accessibleName="Normal" name="information" />}
                className="sap-margin-begin-tiny"
                state="Information"
                title={event.type}
              />
            )}
          </Text>
        }
      />
      <RowComponent
        name={t('events.headers.message')}
        value={event.message || EMPTY_TEXT_PLACEHOLDER}
      />
      <RowComponent
        name={t('events.headers.reason')}
        value={event.reason || EMPTY_TEXT_PLACEHOLDER}
      />
      <RowComponent
        name={t('events.headers.involved-object')}
        value={FormatInvolvedObject(
          event.involvedObject || EMPTY_TEXT_PLACEHOLDER,
        )}
      />
      <RowComponent
        name={t('events.headers.source')}
        value={FormatSourceObject(event.source || EMPTY_TEXT_PLACEHOLDER)}
      />
      <RowComponent
        name={t('events.headers.reporting-component')}
        value={event.reportingComponent || EMPTY_TEXT_PLACEHOLDER}
      />
      <RowComponent
        name={t('events.headers.count')}
        value={event.count || EMPTY_TEXT_PLACEHOLDER}
      />
    </UI5Card>
  );
};

export default function EventDetails({
  resourceName,
  resourceType,
  resourceUrl,
  layoutCloseCreateUrl,
  namespace,
  resourceGraphConfig,
  resourceTitle,
  showYamlTab = true,
  ...props
}: EventDetailsProps) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const customColumns = [
    {
      header: t('common.labels.namespace'),
      value: (event: Record<string, any>) => (
        <Link
          data-testid="details-link"
          url={clusterUrl(
            `namespaces/${event.metadata.namespace}/events/${props.resourceName}`,
          )}
        >
          {event.metadata.namespace}
        </Link>
      ),
    },
    {
      header: t('events.headers.last-seen'),
      value: (event: Record<string, any>) => (
        <ReadableCreationTimestamp timestamp={event.lastTimestamp} />
      ),
    },
  ];

  return (
    <ResourceDetails
      resourceUrl={resourceUrl}
      resourceType={resourceType}
      resourceName={resourceName}
      resourceTitle={resourceTitle}
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      namespace={namespace}
      resourceGraphConfig={resourceGraphConfig}
      showYamlTab={showYamlTab}
      {...props}
      customComponents={[Specification]}
      customColumns={customColumns}
      description={ResourceDescription}
      createResourceForm={EventCreate}
      readOnly
      disableEdit
      hideLabels
      hideAnnotations
      hideLastUpdate
    />
  );
}
