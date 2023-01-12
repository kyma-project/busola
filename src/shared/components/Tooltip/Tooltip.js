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
  delay = [200, 0],
}) => {
  return (
    <TippyTooltip
      className={className}
      html={content}
      position={position}
      trigger={trigger}
      distance={0}
      delay={delay}
      {...tippyProps}
    >
      {children}
    </TippyTooltip>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['mouseenter', 'focus', 'click', 'manual']),
  children: PropTypes.node,
};

Tooltip.defaultProps = {
  trigger: 'mouseenter',
};
