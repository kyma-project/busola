import PropTypes from 'prop-types';
import classNames from 'classnames';
import { RadialChart } from '@ui5/webcomponents-react-charts';
import { spacing } from '@ui5/webcomponents-react-base';
import { Text } from '@ui5/webcomponents-react';
import './UI5RadialChart.scss';

export const UI5RadialChart = ({
  size = 200,
  value,
  max,
  colorNumber = 0,
  onClick,
  additionalInfo = '',
}) => {
  const percent = max && value ? Math.round((value * 100) / max) : 0;
  const text = percent + '%';
  const textSize = size / Math.max(3.5, text.length) + 'px';

  const classnames = classNames(`radial-chart`, {
    'cursor-pointer': onClick,
  });

  let color = 'var(--sapBrandColor)';
  if (colorNumber > 0 && colorNumber < 12) {
    color = `var(--sapChart_OrderedColor_${colorNumber})`;
  }

  return (
    <div className={classnames} onClick={onClick}>
      <RadialChart
        displayValue={text}
        displayValueStyle={{
          fontSize: textSize,
          fill: color,
        }}
        value={value}
        maxValue={max}
        color={color}
        style={{
          height: size + 'px',
          width: size + 'px',
          ...spacing.sapUiTinyMarginTopBottom,
        }}
        chartConfig={{
          innerRadius: '99%',
          outerRadius: '99%',
          barSize: 12,
        }}
      />
      {additionalInfo && (
        <Text className="additional-info">{additionalInfo}</Text>
      )}
    </div>
  );
};

UI5RadialChart.propTypes = {
  size: PropTypes.number,
  colorNumber: PropTypes.number,
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string,
};
