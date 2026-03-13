import { ReactNode } from 'react';

import Tippy from '@tippyjs/react';

import 'tippy.js/dist/tippy.css';
import './Tooltip.scss';

interface TooltipProps {
  children?: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: [number, number];
  className?: string;
  visible?: boolean;
}

export const Tooltip = ({
  children,
  content,
  position,
  delay = [200, 0],
  className = '',
  visible,
}: TooltipProps) => {
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
