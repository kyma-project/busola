import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useJsonata } from '../hooks/useJsonata';
import { spacing } from '@ui5/webcomponents-react-base';
import { useGetTranslation } from '../helpers';
import { EMPTY_TEXT_PLACEHOLDER } from '../../../shared/constants';

export function StatisticalCard({
  structure,
  value,
  originalResource,
  scope,
  arrayItems,
  ...props
}) {
  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });
  const { t } = useGetTranslation();

  const extraInfo = structure.children?.map(child => {
    const [childValue, err] = jsonata(child.source, {
      resource: value,
    });
    if (err) {
      return t('extensibility.configuration-error', {
        error: err.message,
      });
    }

    return {
      title: child.name,
      value: childValue !== undefined ? childValue : EMPTY_TEXT_PLACEHOLDER,
    };
  });

  const [mainValue, err] = jsonata(structure?.mainValue?.source, {
    resource: value,
  });
  if (err) {
    return t('extensibility.configuration-error', {
      error: err.message,
    });
  }

  return (
    <div
      style={{
        ...spacing.sapUiSmallMarginBegin,
        ...spacing.sapUiSmallMarginBottom,
      }}
    >
      <CountingCard
        className="item"
        value={mainValue !== undefined ? mainValue : EMPTY_TEXT_PLACEHOLDER}
        title={structure?.name}
        subTitle={structure?.mainValue?.name}
        // resourceUrl={structure?.resourceUrl}
        extraInfo={extraInfo}
      />
    </div>
  );
}
