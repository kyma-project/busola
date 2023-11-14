import React from 'react';
import classNames from 'classnames';
import { spacing } from '@ui5/webcomponents-react-base';

type SpinnerProps = {
  ariaLabel?: string;
  compact?: boolean;
  size?: 'm' | 'l';
  className?: string;
  center?: boolean;
};

export const Spinner = ({
  ariaLabel = 'Loading',
  compact = false,
  size,
  className = '',
  center = true,
}: SpinnerProps) => {
  size = size || (compact ? 'm' : 'l');
  const sizeClassName = 'fd-busy-indicator--' + size;
  const style = center
    ? {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: spacing.sapUiMediumMarginTop.marginTop,
        marginBottom: spacing.sapUiMediumMarginBottom.marginBottom,
      }
    : {
        marginTop: spacing.sapUiMediumMarginTop.marginTop,
        marginBottom: spacing.sapUiMediumMarginBottom.marginBottom,
      };

  return (
    <div
      className={classNames(sizeClassName, className)}
      style={style}
      aria-hidden="false"
      aria-label={ariaLabel}
    >
      <div className="fd-busy-indicator--circle-0" />
      <div className="fd-busy-indicator--circle-1" />
      <div className="fd-busy-indicator--circle-2" />
    </div>
  );
};
