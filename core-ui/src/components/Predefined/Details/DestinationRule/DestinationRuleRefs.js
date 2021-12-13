import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, FormItem, FormLabel } from 'fundamental-react';
import { Tokens } from 'shared/components/Tokens';

import './DestinationRuleRefs.scss';

export function DestinationRuleRefs(destinationRule) {
  const { t } = useTranslation();

  return (
    <LayoutPanel
      className="fd-margin--md destination-rule-refs-panel"
      key={'destination-rules-ref'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('certificates.refs')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('destination-rules.host')}</FormLabel>
        {destinationRule.spec.host}
      </FormItem>

      {destinationRule.spec.exportTo ? (
        <FormItem>
          <FormLabel>{t('destination-rules.exported-to-namespaces')}</FormLabel>
          <Tokens tokens={destinationRule.spec.exportTo.filter(el => el)} />
        </FormItem>
      ) : null}
    </LayoutPanel>
  );
}
