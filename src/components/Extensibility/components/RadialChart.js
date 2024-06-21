import { Card, CardHeader } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useJsonata } from '../hooks/useJsonata';

export const RadialChart = ({ structure, value, originalResource }) => {
  const { t } = useTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    value,
  });
  let err;
  let maxValue;

  [maxValue, err] = jsonata(structure.maxValue, {
    resource: originalResource,
  });
  if (err) {
    return t('extensibility.configuration-error', {
      error: err.message,
    });
  }

  let additionalInfo;
  [additionalInfo, err] = jsonata(structure.additionalInfo, {
    resource: originalResource,
  });
  if (err) {
    return t('extensibility.configuration-error', {
      error: err.message,
    });
  }

  return (
    <div className={'item-wrapper tall'}>
      <Card
        className="radial-chart-card"
        header={<CardHeader titleText={t(structure?.name)} />}
      >
        <UI5RadialChart
          color={structure.color}
          value={value}
          max={maxValue ? maxValue : structure?.maxValue}
          additionalInfo={
            additionalInfo ? additionalInfo : structure?.additionalInfo
          }
        />
      </Card>
    </div>
  );
};

RadialChart.array = true;
