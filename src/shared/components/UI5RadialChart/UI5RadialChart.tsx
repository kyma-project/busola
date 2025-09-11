import PropTypes from 'prop-types';
import classNames from 'classnames';
import { RadialChart } from '@ui5/webcomponents-react-charts';
import { Text } from '@ui5/webcomponents-react';

import './UI5RadialChart.scss';

interface UI5RadialChartProps {
  size?: number;
  value: number;
  max: number;
  color?: string;
  onClick?: () => void;
  additionalInfo?: string;
}

export const UI5RadialChart = ({
  size = 200,
  value,
  max,
  color = 'var(--sapBrandColor)',
  onClick,
  additionalInfo = '',
}: UI5RadialChartProps) => {
  const percent = max && value ? Math.round((value * 100) / max) : 0;
  const text = (percent > 10_000 ? percent.toPrecision(3) : percent) + '%';
  const textSize = size / Math.max(3.5, text.length) + 'px';

  const classnames = classNames(`radial-chart`, {
    'cursor-pointer': onClick,
  });

  return (
    <div className={classnames} onClick={onClick}>
      <RadialChart
        aria-label={'Radial chart'}
        displayValue={text}
        displayValueStyle={{
          fontSize: textSize,
          fill: color,
        }}
        value={value}
        maxValue={max}
        color={color}
        className="sap-margin-y-tiny"
        style={{
          height: size + 'px',
          width: size + 'px',
        }}
        chartConfig={{
          innerRadius: '98%',
          outerRadius: '98%',
          barSize: 12,
        }}
      />
      {additionalInfo && (
        <Text className="additional-info">{additionalInfo}</Text>
      )}
    </div>
  );
};
