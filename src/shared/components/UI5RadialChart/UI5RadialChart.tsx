import classNames from 'classnames';
import { RadialChart } from '@ui5/webcomponents-react-charts';
import { Card, Text, Title } from '@ui5/webcomponents-react';

import './UI5RadialChart.scss';
import { HintButton } from '../HintButton/HintButton';
import { useState } from 'react';

interface UI5RadialChartProps {
  cardClassName?: string;
  size?: number;
  value: number;
  max: number;
  color?: string;
  onClick?: () => void;
  titleText: string;
  additionalInfo?: string;
  accessibleName: string;
  tooltipInfo?: string;
}

export const UI5RadialChart = ({
  cardClassName,
  size = 200,
  value,
  max,
  color = 'var(--sapBrandColor)',
  onClick,
  titleText,
  additionalInfo = '',
  accessibleName,
  tooltipInfo,
}: UI5RadialChartProps) => {
  const percent = max && value ? Math.round((value * 100) / max) : 0;
  const text = (percent > 10_000 ? percent.toPrecision(3) : percent) + '%';
  const textSize = size / Math.max(3.5, text.length) + 'px';

  const classnames = classNames(`radial-chart`, {
    'cursor-pointer': onClick,
  });
  const cardClassnames = classNames(`radial-chart-card`, cardClassName);

  const [showTitleDescription, setShowTitleDescription] = useState(false);

  return (
    <Card
      className={cardClassnames}
      accessibleName={accessibleName}
      header={
        <div className="radial-chart-card-header">
          <Title className="ui5-card-header-title" size="H6">
            {titleText}
          </Title>
          {tooltipInfo && (
            <HintButton
              className="sap-margin-begin-tiny"
              setShowTitleDescription={setShowTitleDescription}
              description={tooltipInfo}
              showTitleDescription={showTitleDescription}
              ariaTitle={tooltipInfo}
            />
          )}
        </div>
      }
    >
      <div
        className={classnames}
        onClick={onClick}
        aria-label={`${accessibleName}, radial chart, ${text}${additionalInfo ? `, ${additionalInfo}` : ''}`}
        role="img"
      >
        <RadialChart
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
    </Card>
  );
};
