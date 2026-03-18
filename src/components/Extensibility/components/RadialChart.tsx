import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useJsonata } from '../hooks/useJsonata';

interface RadialChartProps {
  structure: any;
  value: any;
  originalResource: any;
}

export const RadialChart = ({
  structure,
  value,
  originalResource,
}: RadialChartProps) => {
  const { t } = useTranslation();
  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      value,
    }),
    [originalResource, value],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const [error, setError] = useState<any>(null);
  const [maxValue, setMaxValue] = useState<any>(null);
  const [additionalInfo, setAdditionalInfo] = useState<any>(null);

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
  }, [structure.maxValue, structure.additionalInfo, stableJsonataDeps]);

  if (error) {
    return t('extensibility.configuration-error', {
      error: error.message,
    });
  }

  return (
    <div className="item-wrapper card-tall">
      <UI5RadialChart
        tooltipInfo={structure?.tooltipInfo}
        color={structure.color}
        value={value}
        max={maxValue ? maxValue : structure?.maxValue}
        titleText={t(structure?.name, { defaultValue: structure?.name ?? '' })}
        additionalInfo={
          additionalInfo ? additionalInfo : structure?.additionalInfo
        }
        accessibleName={t(structure?.name, {
          defaultValue: structure?.name ?? '',
        })}
      />
    </div>
  );
};
