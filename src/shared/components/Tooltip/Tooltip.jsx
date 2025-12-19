import PropTypes from 'prop-types';

import Tippy from '@tippyjs/react';

import 'tippy.js/dist/tippy.css';
import './Tooltip.scss';

export const Tooltip = ({
  children,
  content,
  position,
  delay = [200, 0],
  className = '',
  visible,
}) => {
  return (
    <Tippy
      content={content}
      placement={position}
      delay={delay}
      visible={visible}
    >
      <span className={className}>{children}</span>
    </Tippy>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  children: PropTypes.node,
  delay: PropTypes.array,
  className: PropTypes.string,
  visible: PropTypes.bool,
};
