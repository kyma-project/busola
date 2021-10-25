import { MessageStrip } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid } from './helpers';

export function InvalidRoleError({ rule }) {
  const { t } = useTranslation();

  return (
    isRuleInvalid(rule) && (
      <MessageStrip type="warning" className="fd-margin-top--sm">
        {t('roles.messages.invalid')}
      </MessageStrip>
    )
  );
}
