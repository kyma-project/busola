import { Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';

type LabelSelectorRequirement = {
  key: string;
  operator: string;
  values?: string[];
};

export type Selector = {
  matchLabels?: Record<string, string>;
  matchExpressions?: LabelSelectorRequirement[];
};

// Same notation as kubectl, e.g. `tier in (frontend,backend)`.
const formatRequirement = ({
  key,
  operator,
  values = [],
}: LabelSelectorRequirement) => {
  switch (operator) {
    case 'In':
      return `${key} in (${values.join(',')})`;
    case 'NotIn':
      return `${key} notin (${values.join(',')})`;
    case 'Exists':
      return key;
    case 'DoesNotExist':
      return `!${key}`;
    default:
      return `${key} ${operator} (${values.join(',')})`;
  }
};

export const LabelSelector = ({ selector }: { selector: Selector }) => {
  const { t } = useTranslation();

  const requirements = [
    ...Object.entries(selector.matchLabels ?? {}).map(
      ([key, value]) => `${key}=${value}`,
    ),
    ...(selector.matchExpressions ?? []).map(formatRequirement),
  ];

  if (!requirements.length) {
    return <Text>{t('network-policies.present-but-empty')}</Text>;
  }

  return <Tokens tokens={requirements} />;
};
