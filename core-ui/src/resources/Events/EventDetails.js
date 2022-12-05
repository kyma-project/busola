import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, LayoutPanel } from 'fundamental-react';
import { Link } from 'react-router-dom';

import { useUrl } from 'hooks/useUrl';
import { FormatInvolvedObject, FormatSourceObject } from 'hooks/useMessageList';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const RowComponent = ({ name, value }) =>
  value ? <LayoutPanelRow name={name} value={value} /> : null;

const Message = event => {
  const { t } = useTranslation();

  return (
    <LayoutPanel key="specification-panel" className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('events.headers.message')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {event.message && (
          <RowComponent
            name={t('events.headers.message')}
            value={event.message}
          />
        )}
        {event.reason && (
          <RowComponent
            name={t('events.headers.reason')}
            value={event.reason}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
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
          className="fd-link"
          data-testid="details-link"
          to={clusterUrl(`namespaces/${event.metadata.namespace}`)}
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
              <Icon
                ariaLabel="Warning"
                glyph="message-warning"
                size="s"
                className="fd-has-color-status-2 has-tooltip"
              />
            </Tooltip>
          ) : (
            <Tooltip content={event.type}>
              <Icon
                ariaLabel="Normal"
                glyph="message-information"
                size="s"
                className="has-tooltip"
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
      {...props}
      readOnly={true}
    />
  );
}

export default EventDetails;
