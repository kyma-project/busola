import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip as TippyTooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import './Tooltip.scss';

export const Tooltip = ({
  children,
  content,
  position,
  trigger,
  tippyProps,
  className,
  isInlineHelp = false,
}) => {
  return (
    <TippyTooltip
      className={className}
      html={content}
      position={position}
      trigger={trigger}
      {...tippyProps}
    >
      {isInlineHelp && (
        <span className="sap-icon--sys-help fd-margin-begin--tiny"></span>
      )}
      {children}
    </TippyTooltip>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['mouseenter', 'focus', 'click', 'manual']),
  children: PropTypes.node,
  isInlineHelp: PropTypes.bool,
};

Tooltip.defaultProps = {
  trigger: 'mouseenter',
};
