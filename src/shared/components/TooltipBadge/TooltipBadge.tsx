import { ObjectStatus } from '@ui5/webcomponents-react';
import classNames from 'classnames';
import { ReactNode } from 'react';

import './TooltipBadge.scss';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

interface TooltipBadgeProps {
  children?: ReactNode;
  tooltipContent?: ReactNode;
  type: 'Information' | 'Positive' | 'Negative' | 'Critical' | 'None';
  tooltipProps?: any;
  className?: string;
}

export const TooltipBadge = ({
  children,
  tooltipContent,
  type,
  tooltipProps = {},
  className,
}: TooltipBadgeProps) => {
  const classes = classNames('tooltip-badge', 'has-tooltip', className);

  const badgeElement = (
    <ObjectStatus
      aria-label="Status"
      role="status"
      inverted
      state={type}
      className={classes}
      data-testid={'has-tooltip'}
      showDefaultIcon={type !== 'Information'}
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
