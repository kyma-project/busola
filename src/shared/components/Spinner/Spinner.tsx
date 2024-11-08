import { BusyIndicator } from '@ui5/webcomponents-react';

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
      }
    : {};

  return (
    <BusyIndicator
      active={true}
      size={size}
      aria-label={ariaLabel}
      style={style}
      className="sap-margin-y-small"
    />
  );
};
