import { BusyIndicator } from '@ui5/webcomponents-react';
import { spacing } from 'shared/helpers/spacing';

type SpinnerProps = {
  ariaLabel?: string;
  size?: 'Large' | 'Medium' | 'Small';
  center?: boolean;
};

export const Spinner = ({
  ariaLabel = 'Loading',
  size = 'Medium',
  center = true,
}: SpinnerProps) => {
  const style = center
    ? {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: spacing.sapUiSmallMarginTop.marginTop,
        marginBottom: spacing.sapUiSmallMarginBottom.marginBottom,
      }
    : {
        marginTop: spacing.sapUiSmallMarginTop.marginTop,
        marginBottom: spacing.sapUiSmallMarginBottom.marginBottom,
      };

  return (
    <BusyIndicator
      active={true}
      size={size}
      aria-label={ariaLabel}
      style={style}
    />
  );
};
