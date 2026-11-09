import {
  bytesToHumanReadable,
  cpusToHumanReadable,
} from 'shared/helpers/resources';
import { UI5RadialChart } from '../UI5RadialChart/UI5RadialChart';

type ResourceRadialChartProps = {
  cardClassName?: string;
  value: number;
  max: number;
  color?: string;
  titleText: string;
  accessibleName: string;
  tooltipInfo?: string;
  valueType: 'cpu' | 'bytes';
  unit?: 'm' | 'Mi' | 'Gi';
};

export function ResourceRadialChart({
  cardClassName,
  value,
  max,
  color = 'var(--sapBrandColor)',
  titleText,
  accessibleName,
  tooltipInfo,
  valueType,
  unit = 'm',
}: ResourceRadialChartProps) {
  const formattedValue =
    valueType === 'cpu'
      ? cpusToHumanReadable(value, {
          unit,
        })
      : bytesToHumanReadable(value, { unit });
  const formattedMax =
    valueType === 'cpu'
      ? cpusToHumanReadable(max, {
          unit,
        })
      : bytesToHumanReadable(max, { unit });
  return (
    <UI5RadialChart
      tooltipInfo={tooltipInfo}
      cardClassName={cardClassName}
      color={color}
      // Raw value/max: a coarse unit (Gi) would round small usage to 0 and blank the ring.
      value={value}
      max={max}
      titleText={titleText}
      additionalInfo={`${formattedValue.string} / ${formattedMax.string}`}
      accessibleName={accessibleName}
    />
  );
}
