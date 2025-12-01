import { FC, ReactNode } from 'react';
import { ProgressIndicator } from '@ui5/webcomponents-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import './ProgressIndicatorWithTooltip.scss';

type TooltipWrapperProps = {
  tooltipProps?: any | null;
  children: ReactNode;
};

const TooltipWrapper: FC<TooltipWrapperProps> = ({
  tooltipProps,
  children,
}) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return <>{children}</>;
};

export type ProgressIndicatorWithTooltipProps = {
  value: number;
  tooltip?: any;
  displayValue?: string;
  accessibleName?: string;
};

export const ProgressIndicatorWithTooltip: FC<
  ProgressIndicatorWithTooltipProps
> = ({
  value,
  tooltip,
  displayValue,
  accessibleName = 'Progress indicator',
}) => {
  const tooltipProps = tooltip
    ? { ...tooltip, style: { width: '100%' } }
    : undefined;

  return (
    <TooltipWrapper tooltipProps={tooltipProps}>
      <ProgressIndicator
        accessibleName={accessibleName}
        displayValue={displayValue}
        value={value}
        className="progress-indicator"
        style={{ position: 'relative', zIndex: 0 }}
      />
    </TooltipWrapper>
  );
};
