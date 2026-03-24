import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { isRuleInvalid } from './helpers';

interface InvalidRoleErrorProps {
  rule: any;
}

export function InvalidRoleError({ rule }: InvalidRoleErrorProps) {
  const { t } = useTranslation();

  return (
    isRuleInvalid(rule) && (
      <MessageStrip
        design="Critical"
        hideCloseButton
        className="sap-margin-top-small"
      >
        {t('roles.messages.invalid')}
      </MessageStrip>
    )
  );
}
