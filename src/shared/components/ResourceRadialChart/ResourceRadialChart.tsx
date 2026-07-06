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
  valueType?: 'cpu' | 'bytes';
  unit: 'm' | 'Mi';
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
  unit,
}: ResourceRadialChartProps) {
  return (
    <UI5RadialChart
      tooltipInfo={tooltipInfo}
      cardClassName={cardClassName}
      color={color}
      value={
        valueType === 'cpu'
          ? cpusToHumanReadable(value, {
              unit,
            }).value
          : bytesToHumanReadable(value, { unit }).value
      }
      max={
        valueType === 'cpu'
          ? cpusToHumanReadable(max, {
              unit,
            }).value
          : bytesToHumanReadable(max, { unit }).value
      }
      titleText={titleText}
      additionalInfo={`${
        cpusToHumanReadable(value, {
          unit,
        }).string
      } / ${
        cpusToHumanReadable(max, {
          unit,
        }).string
      }`}
      accessibleName={accessibleName}
    />
  );
}
