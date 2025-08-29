import { useEffect, useState } from 'react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useJsonata } from '../hooks/useJsonata';
import { useGetTranslation } from '../helpers';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function StatisticalCard({
  structure,
  value,
  originalResource,
  general,
  context,
}) {
  const jsonata = useJsonata({
    resource: originalResource,
    value,
  });
  const { t } = useGetTranslation();

  const [extraInfo, setExtraInfo] = useState([]);
  const [err, setErr] = useState(null);
  const [mainValue, setMainValue] = useState(null);

  useEffect(() => {
    Promise.all(
      structure.children?.map(async child => {
        const [childValue, err] = await jsonata(child.source, {
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
      }),
    ).then(results => setExtraInfo(results));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.children]);

  useEffect(() => {
    jsonata(structure?.mainValue?.source, {
      resource: value,
    }).then(([res, error]) => {
      setMainValue(res);
      setErr(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.mainValue?.source]);

  if (err) {
    return t('extensibility.configuration-error', {
      error: err.message,
    });
  }

  return (
    <div className={`item-wrapper ${extraInfo ? 'card-wide' : 'card-small'}`}>
      <CountingCard
        className="item"
        value={mainValue !== undefined ? mainValue : EMPTY_TEXT_PLACEHOLDER}
        title={structure?.name}
        subTitle={structure?.mainValue?.name}
        resourceUrl={context !== general?.urlPath ? general?.urlPath : null}
        isClusterResource={general?.scope === 'cluster'}
        allNamespaceURL={general?.scope === 'namespace'}
        extraInfo={extraInfo}
      />
    </div>
  );
}

StatisticalCard.array = true;
