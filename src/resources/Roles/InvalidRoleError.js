import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid } from './helpers';

import { spacing } from '@ui5/webcomponents-react-base';

export function InvalidRoleError({ rule }) {
  const { t } = useTranslation();

  return (
    isRuleInvalid(rule) && (
      <MessageStrip
        design="Warning"
        hideCloseButton
        style={spacing.sapUiSmallMarginTop}
      >
        {t('roles.messages.invalid')}
      </MessageStrip>
    )
  );
}
