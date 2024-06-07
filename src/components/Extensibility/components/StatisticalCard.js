import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useJsonata } from '../hooks/useJsonata';

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

  const extraInfo = structure.children?.map(child => {
    let childValue = undefined;
    let eventFilterError;
    try {
      [childValue, eventFilterError] = jsonata(child.source, {
        resource: value,
      });
      if (eventFilterError) throw eventFilterError;
    } catch (e) {
      throw e;
      // return { title: 'Error', value: e };
    }

    return {
      title: child.name,
      value: childValue,
    };
  });

  return (
    <div className={`item-wrapper ${structure?.children ? 'wide' : 'small'}`}>
      <CountingCard
        className="item"
        value={value || 'N/A'}
        title={structure?.name}
        subTitle={structure?.mainStatistic?.name}
        // resourceUrl={structure?.resourceUrl}
        // isClusterResource={structure?.isClusterResource}
        extraInfo={extraInfo}
      />
    </div>
  );
}
