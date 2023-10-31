import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid, hasRuleRequiredProperties } from './helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Icon } from '@ui5/webcomponents-react';

export function RuleTitle({ rule, i }) {
  const { t } = useTranslation();

  const Alert = ({ tooltipContent }) => (
    <Tooltip
      position="right"
      className="fd-margin-end--tiny"
      content={tooltipContent}
      delay={0}
    >
      <Icon
        className="bsl-color--warning"
        aria-label={t('common.messages.validation-error')}
        name="alert"
      />
    </Tooltip>
  );

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
