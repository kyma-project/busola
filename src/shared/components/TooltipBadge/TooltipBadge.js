import React from 'react';

import { ObjectStatus } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './TooltipBadge.scss';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export const TooltipBadge = ({
  children,
  tooltipContent,
  type,
  tooltipProps = {},
  className,
}) => {
  const classes = classNames('tooltip-badge', 'has-tooltip', className);

  const badgeElement = (
    <ObjectStatus
      aria-label="Status"
      role="status"
      inverted
      state={type}
      className={classes}
      data-testid={'has-tooltip'}
    >
      {children}
    </ObjectStatus>
  );

  return (
    <Tooltip content={tooltipContent} {...tooltipProps}>
      {badgeElement}
    </Tooltip>
  );
};

TooltipBadge.propTypes = {
  tooltipContent: PropTypes.node,
  type: PropTypes.oneOf(['Success', 'Error', 'None', 'Information']),
  tooltipProps: PropTypes.object,
  className: PropTypes.string,
};
