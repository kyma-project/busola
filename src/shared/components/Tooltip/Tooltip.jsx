import PropTypes from 'prop-types';

import Tippy from '@tippyjs/react';

import 'tippy.js/dist/tippy.css';
import './Tooltip.scss';

export const Tooltip = ({
  children,
  content = {},
  position,
  trigger = 'mouseenter',
  tippyProps = {},
  delay = [200, 0],
  style = null,
  className = '',
}) => {
  return (
    <Tippy
      className={className}
      content={content}
      placement={position}
      trigger={trigger}
      offset={[0, 0]}
      delay={delay}
      {...tippyProps}
    >
      <span style={style}>{children}</span>
    </Tippy>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['mouseenter', 'focus', 'click', 'manual']),
  children: PropTypes.node,
};
