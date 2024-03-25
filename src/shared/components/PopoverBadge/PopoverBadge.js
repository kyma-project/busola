import React, { useRef, useState } from 'react';

import { ObjectStatus, Popover } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './PopoverBadge.scss';
import { createPortal } from 'react-dom';

export const PopoverBadge = ({ children, tooltipContent, type, className }) => {
  const classes = classNames('popover-badge', 'has-tooltip', className);
  const [openPopover, setOpenPopover] = useState(false);
  const popoverRef = useRef(null);
  const openerRef = useRef(null);

  const handleOpenerClick = e => {
    e.stopPropagation();
    if (popoverRef.current) {
      popoverRef.current.opener = openerRef.current;
      setOpenPopover(prev => !prev);
    }
  };

  const badgeElement = (
    <button
      ref={openerRef}
      onClick={handleOpenerClick}
      style={{ width: 'fit-content', height: 'fit-content' }}
      className="badge-wrap"
    >
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

PopoverBadge.propTypes = {
  tooltipContent: PropTypes.node,
  type: PropTypes.oneOf(['Information', 'Success', 'Error', 'Warning', 'None']),
  className: PropTypes.string,
};
