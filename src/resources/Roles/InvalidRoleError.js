import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid } from './helpers';

export function InvalidRoleError({ rule }) {
  const { t } = useTranslation();

  return (
    isRuleInvalid(rule) && (
      <MessageStrip
        design="Warning"
        hideCloseButton
        className="bsl-margin-top--sm"
      >
        {t('roles.messages.invalid')}
      </MessageStrip>
    )
  );
}
