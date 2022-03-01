import React from 'react';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export default function ServiceListItem({ service }) {
  console.log('service', service);
  const { t } = useTranslation();
  const glyphType = toggle => (toggle ? 'accept' : 'decline');

  return (
    <Tooltip
      tippyProps={{ duration: 0 }}
      placement="left"
      content={
        <>
          {t('applications.headers.apis')}:{' '}
          <Icon
            glyph={glyphType(service.hasAPIs)}
            ariaLabel={
              service.hasAPIs
                ? t('applications.messages.some-apis')
                : t('applications.messages.no-apis')
            }
          />
          <br />
          {t('applications.headers.events')}:
          <Icon
            glyph={glyphType(service.hasEvents)}
            ariaLabel={
              service.hasEvents
                ? t('applications.messages.some-events')
                : t('applications.messages.no-events')
            }
          />
        </>
      }
    >
      <span className="fd-has-color-status-4">{service.displayName}</span>
    </Tooltip>
  );
}
