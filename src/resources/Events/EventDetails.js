import { useTranslation } from 'react-i18next';

import { useUrl } from 'hooks/useUrl';
import { FormatInvolvedObject, FormatSourceObject } from 'hooks/useMessageList';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Icon, ObjectStatus } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/Events';
import { Link } from 'shared/components/Link/Link';

const RowComponent = ({ name, value }) =>
  value ? <LayoutPanelRow name={name} value={value} /> : null;

const Message = event => {
  const { t } = useTranslation();

  return (
    <UI5Panel
      title={t('events.headers.message')}
      keyComponent="specification-panel"
    >
      {event.message && (
        <RowComponent
          name={t('events.headers.message')}
          value={event.message}
        />
      )}
      {event.reason && (
        <RowComponent name={t('events.headers.reason')} value={event.reason} />
      )}
    </UI5Panel>
  );
};

export function EventDetails(props) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const customColumns = [
    {
      header: t('events.headers.involved-object'),
      value: event => FormatInvolvedObject(event.involvedObject),
    },
    {
      header: t('events.headers.source'),
      value: event =>
        FormatSourceObject(event.source || EMPTY_TEXT_PLACEHOLDER),
    },
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
      header: t('events.headers.type'),
      value: event => (
        <p>
          {event.type}{' '}
          {event.type === 'Warning' ? (
            <Tooltip content={event.type}>
              <ObjectStatus
                aria-label="Warning"
                icon={<Icon name="message-warning" />}
                className="has-tooltip"
                state="Warning"
              />
            </Tooltip>
          ) : (
            <Tooltip content={event.type}>
              <ObjectStatus
                aria-label="Normal"
                icon={<Icon name="message-information" />}
                className="has-tooltip"
                state="Information"
              />
            </Tooltip>
          )}
        </p>
      ),
    },
    {
      header: t('events.headers.count'),
      value: event => <p>{event.count || EMPTY_TEXT_PLACEHOLDER}</p>,
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
      customComponents={[Message]}
      customColumns={customColumns}
      description={ResourceDescription}
      {...props}
      readOnly={true}
    />
  );
}

export default EventDetails;
