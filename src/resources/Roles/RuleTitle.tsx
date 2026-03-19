import { useTranslation } from 'react-i18next';
import { hasRuleRequiredProperties, isRuleInvalid } from './helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Icon } from '@ui5/webcomponents-react';

const Alert = ({ tooltipContent }: { tooltipContent: string }) => {
  const { t } = useTranslation();

  return (
    <Tooltip position="right" content={tooltipContent} delay={[0, 0]}>
      <Icon
        className="bsl-color--warning"
        accessibleName={t('common.messages.validation-error')}
        name="alert"
      />
    </Tooltip>
  );
};

interface RuleTitleProps {
  rule: any;
  i: number;
}

export function RuleTitle({ rule, i }: RuleTitleProps) {
  const { t } = useTranslation();

  if (isRuleInvalid(rule)) {
    return (
      <span>
        {i + 1} <Alert tooltipContent={t('roles.messages.invalid')} />
      </span>
    );
  } else if (!hasRuleRequiredProperties(rule)) {
    return (
      <span>
        {i + 1}{' '}
        <Alert tooltipContent={t('common.messages.fill-required-data')} />
      </span>
    );
  } else {
    return i + 1;
  }
}
