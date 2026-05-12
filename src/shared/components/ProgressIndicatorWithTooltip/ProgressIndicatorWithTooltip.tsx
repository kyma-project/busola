import { ProgressIndicator } from '@ui5/webcomponents-react';
import './ProgressIndicatorWithTooltip.scss';

export type ProgressIndicatorWithTooltipProps = {
  value: number;
  tooltip?: string;
  displayValue?: string;
  accessibleName?: string;
};

export const ProgressIndicatorWithTooltip = ({
  value,
  tooltip,
  displayValue,
  accessibleName = 'Progress indicator',
}: ProgressIndicatorWithTooltipProps) => {
  return (
    <ProgressIndicator
      accessibleName={accessibleName}
      displayValue={displayValue}
      value={value}
      title={tooltip}
      className="progress-indicator"
    />
  );
};
