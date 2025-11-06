import { useEffect, useState } from 'react';
import { ConditionList as ConditionListComponent } from 'shared/components/ConditionList/ConditionList';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';
import { getBadgeType } from 'components/Extensibility/helpers';
import { Widget } from './Widget';

export const ConditionList = ({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}) => {
  const { t } = useTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope,
    value,
    arrayItems,
  });

  const [conditions, setConditions] = useState(null);
  const stringifiedDeps = JSON.stringify([
    arrayItems,
    value,
    scope,
    embedResource,
    singleRootResource,
    originalResource,
  ]);

  useEffect(() => {
    if (!Array.isArray(value) || value?.length === 0) {
      return;
    }
    Promise.all(
      value.map(async (v) => {
        const override = structure?.highlights?.find((o) => o.type === v.type);
        const customContentPromise = await Promise.all(
          (structure?.customContent || []).map(async (c) => {
            return {
              ...c,
              value:
                typeof c.value === 'object' ? (
                  <Widget
                    value={originalResource}
                    structure={c.value}
                    originalResource={originalResource}
                    scope={scope}
                    singleRootResource={singleRootResource}
                    embedResource={embedResource}
                  />
                ) : (
                  await jsonata(c.value)
                ),
            };
          }),
        );
        const customContent = customContentPromise.filter(
          (c) => c.type === v.type,
        );

        const badgeType = override
          ? await getBadgeType(override, v.status, jsonata, t)
          : undefined;
        return {
          header: {
            status: v.status,
            titleText: v.type,
            overrideStatusType: badgeType,
          },
          message: v.message,
          customContent: customContent ?? [],
        };
      }),
    ).then((results) => setConditions(results));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.customContent, structure?.highlights, stringifiedDeps]);

  if (!Array.isArray(value) || value?.length === 0) {
    return null;
  }

  return conditions && <ConditionListComponent conditions={conditions} />;
};

ConditionList.array = true;
