import React, { ReactNode, useRef, useState } from 'react';

import { ObjectStatus, Popover } from '@ui5/webcomponents-react';
import classNames from 'classnames';

import './PopoverBadge.scss';
import { createPortal } from 'react-dom';

interface PopoverBadgeProps {
  children?: ReactNode;
  tooltipContent: ReactNode;
  type: 'Information' | 'Success' | 'Error' | 'Warning' | 'None';
  className?: string;
}

export const PopoverBadge = ({
  children,
  tooltipContent,
  type,
  className,
}: PopoverBadgeProps) => {
  const classes = classNames('popover-badge', 'has-tooltip', className);
  const [openPopover, setOpenPopover] = useState(false);
  const popoverRef = useRef<any>(null);
  const openerRef = useRef(null);

  const handleOpenerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (popoverRef.current) {
      popoverRef.current.opener = openerRef.current;
      setOpenPopover(prev => !prev);
    }
  };

  const badgeElement = (
    <button ref={openerRef} onClick={handleOpenerClick} className="badge-wrap">
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
    </button>
  );

  return (
    <>
      {createPortal(
        <Popover
          ref={popoverRef}
          open={openPopover}
          onAfterClose={e => {
            e.stopPropagation();
            setOpenPopover(false);
          }}
          placementType="Right"
        >
          {tooltipContent}
        </Popover>,
        document.body,
      )}
      {badgeElement}
    </>
  );
};
