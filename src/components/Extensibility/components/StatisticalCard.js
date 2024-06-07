import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useJsonata } from '../hooks/useJsonata';
import { spacing } from '@ui5/webcomponents-react-base';
import { useGetTranslation } from '../helpers';

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
      value: childValue !== undefined ? childValue : 'N/A', //TODO: use translation
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
        value={mainValue !== undefined ? mainValue : 'N/A'}
        title={structure?.name}
        subTitle={structure?.mainValue?.name}
        // resourceUrl={structure?.resourceUrl}
        // isClusterResource={structure?.isClusterResource}
        extraInfo={extraInfo}
      />
    </div>
  );
}
