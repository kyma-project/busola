import { ConditionList as ConditionListComponent } from 'shared/components/ConditionList/ConditionList';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';
import { getBadgeType } from 'components/Extensibility/helpers';

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

  if (!Array.isArray(value) || value?.length === 0) {
    return null;
  }

  const conditions = value.map(v => {
    const override = structure?.highlights?.find(o => o.type === v.type);
    const badgeType = override
      ? getBadgeType(override, v.status, jsonata, t)
      : undefined;
    return {
      header: {
        status: v.status,
        titleText: v.type,
        overrideStatusType: badgeType,
      },
      message: v.message,
    };
  });

  return <ConditionListComponent conditions={conditions} />;
};

ConditionList.array = true;
