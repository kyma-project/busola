import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid } from './helpers';

import { spacing } from 'shared/helpers/spacing';

export function InvalidRoleError({ rule }) {
  const { t } = useTranslation();

  return (
    isRuleInvalid(rule) && (
      <MessageStrip
        design="Critical"
        hideCloseButton
        style={spacing.sapUiSmallMarginTop}
      >
        {t('roles.messages.invalid')}
      </MessageStrip>
    )
  );
}
