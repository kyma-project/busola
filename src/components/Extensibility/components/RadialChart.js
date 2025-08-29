import { useEffect, useState } from 'react';
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

  const [error, setError] = useState(null);
  const [maxValue, setMaxValue] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState(null);

  useEffect(() => {
    jsonata(structure.maxValue, {
      resource: originalResource,
    }).then(([value, error]) => {
      setMaxValue(value);
      if (error) setError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.maxValue]);

  useEffect(() => {
    jsonata(structure.additionalInfo, {
      resource: originalResource,
    }).then(([value, error]) => {
      setAdditionalInfo(value);
      if (error) setError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.additionalInfo]);

  if (error) {
    return t('extensibility.configuration-error', {
      error: error.message,
    });
  }

  return (
    <div className="item-wrapper card-tall">
      <Card
        className="radial-chart-card"
        accessibleName={t(structure?.name)}
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
