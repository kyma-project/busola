import React from 'react';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'react-shared';

export default function ServiceListItem({ service }) {
  const glyphType = toggle => (toggle ? 'accept' : 'decline');

  return (
    <Tooltip
      tippyProps={{ duration: 0 }}
      placement="left"
      content={
        <>
          APIs:{' '}
          <Icon
            glyph={glyphType(service.hasAPIs)}
            ariaLabel={
              service.hasAPIs ? 'There are some APIs' : 'There are no APIs'
            }
          />
          <br />
          Events:
          <Icon
            glyph={glyphType(service.hasEvents)}
            ariaLabel={
              service.hasEvents
                ? 'There are some events'
                : 'There are no events'
            }
          />
        </>
      }
    >
      <span className="fd-has-color-status-4">{service.displayName}</span>
    </Tooltip>
  );
}
