import React from 'react';

import { ObjectStatus } from 'fundamental-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './TooltipBadge.scss';
import { Tooltip } from '../Tooltip/Tooltip';

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
      ariaLabel="Status"
      role="status"
      inverted
      status={type}
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
  type: PropTypes.oneOf(['positive', 'negative', 'critical', 'informative']),
  tooltipProps: PropTypes.object,
  className: PropTypes.string,
};
