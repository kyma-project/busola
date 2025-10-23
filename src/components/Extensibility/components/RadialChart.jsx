import { useEffect, useState } from 'react';
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
    const setStatesFromJsonata = async () => {
      const [maxValueRes, maxValueErr] = await jsonata(structure.maxValue, {
        resource: originalResource,
      });
      const [additionalInfoRes, additionalInfoErr] = await jsonata(
        structure.additionalInfo,
        {
          resource: originalResource,
        },
      );
      setMaxValue(maxValueRes);
      setAdditionalInfo(additionalInfoRes);
      setError(maxValueErr ?? additionalInfoErr);
    };
    setStatesFromJsonata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.maxValue, structure.additionalInfo, originalResource, value]);

  if (error) {
    return t('extensibility.configuration-error', {
      error: error.message,
    });
  }

  return (
    <div className="item-wrapper card-tall">
      <UI5RadialChart
        color={structure.color}
        value={value}
        max={maxValue ? maxValue : structure?.maxValue}
        titleText={t(structure?.name)}
        additionalInfo={
          additionalInfo ? additionalInfo : structure?.additionalInfo
        }
        accessibleName={t(structure?.name)}
      />
    </div>
  );
};
