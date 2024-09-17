import { useTranslation } from 'react-i18next';

import { useUrl } from 'hooks/useUrl';
import { FormatInvolvedObject, FormatSourceObject } from 'hooks/useMessageList';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/Events';
import EventCreate from './EventYaml';
import { Link } from 'shared/components/Link/Link';
import { spacing } from '@ui5/webcomponents-react-base';

const RowComponent = ({ name, value }) =>
  value ? <LayoutPanelRow name={name} value={value} /> : null;

const Specification = event => {
  const { t } = useTranslation();

  return (
    <UI5Panel
      key="message"
      title={t('common.headers.configuration')}
      keyComponent="specification-panel"
    >
      <RowComponent
        name={t('events.headers.type')}
        value={
          <Text style={{ display: 'flex', alignItems: 'center' }}>
            {event.type}{' '}
            {event.type === 'Warning' ? (
              <ObjectStatus
                aria-label="Warning"
                icon={<Icon name="warning" />}
                className="has-tooltip"
                state="Warning"
                style={spacing.sapUiTinyMarginBegin}
              />
            ) : (
              <ObjectStatus
                aria-label="Normal"
                icon={<Icon name="information" />}
                className="has-tooltip"
                state="Information"
                style={spacing.sapUiTinyMarginBegin}
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
    </UI5Panel>
  );
};

export default function EventDetails(props) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const customColumns = [
    {
      header: t('common.labels.namespace'),
      value: event => (
        <Link
          data-testid="details-link"
          url={clusterUrl(`namespaces/${event.metadata.namespace}`)}
        >
          {event.metadata.namespace}
        </Link>
      ),
    },
    {
      header: t('events.headers.last-seen'),
      value: event => (
        <ReadableCreationTimestamp timestamp={event.lastTimestamp} />
      ),
    },
  ];

  return (
    <ResourceDetails
      customComponents={[Specification]}
      customColumns={customColumns}
      description={ResourceDescription}
      createResourceForm={EventCreate}
      readOnly
      disableEdit
      hideLabels
      hideAnnotations
      hideLastUpdate
      {...props}
    />
  );
}
