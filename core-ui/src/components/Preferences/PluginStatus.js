import React from 'react';
import { StatusBadge } from 'react-shared';

export function PluginStatus({ plugin }) {
  const { isEnabled, isActive } = plugin;

  // todo?
  if (!isEnabled) {
    return (
      <StatusBadge tooltipContent={'Disabled by the user.'} delay={0}>
        disabled
      </StatusBadge>
    );
  } else if (isActive) {
    return (
      <div style={{ width: 'min-content' }}>
        <StatusBadge type="success" noTooltip>
          active
        </StatusBadge>
      </div>
    );
  } else {
    return (
      <StatusBadge
        type="warning"
        tooltipContent="Does not meet selectors."
        delay={0}
      >
        inactive
      </StatusBadge>
    );
  }
}
