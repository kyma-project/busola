import { ConditionList as ConditionListComponent } from 'shared/components/ConditionList/ConditionList';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';

function getType(highlights, value, jsonata, t) {
  let type = null;
  if (highlights) {
    const match = Object.entries(highlights).find(([key, rule]) => {
      if (key === 'type') {
        return null;
      }
      if (Array.isArray(rule)) {
        return rule.includes(value);
      } else {
        const [doesMatch, matchError] = jsonata(rule);
        if (matchError) {
          console.error(
            t('extensibility.configuration-error', {
              error: matchError.message,
            }),
          );
          return false;
        }
        return doesMatch;
      }
    });
    if (match) {
      type = match[0];
    }
  }

  if (type === 'negative') type = 'Warning';
  else if (type === 'informative') type = 'Information';
  else if (type === 'positive') type = 'Success';
  else if (type === 'critical') type = 'Error';
  else if (type === 'none') type = 'None';

  return type;
}
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
    const override = structure.highlights.find(o => o.type === v.type);
    const badgeType = override
      ? getType(override, v.status, jsonata, t)
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
