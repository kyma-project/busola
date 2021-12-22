import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';

export const TlsSettings = ({ tls }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('destination-rules.details.tls-settings')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>
          {t('destination-rules.details.client-certificate')}
        </FormLabel>
        {tls.clientCertificate || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.private-key')}</FormLabel>
        {tls.privateKey || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.ca-certificates')}</FormLabel>
        {tls.caCertificates || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.credential-name')}</FormLabel>
        {tls.credentialName || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.alt-names')}</FormLabel>

        {tls.subjectAltNames ? (
          <Tokens tokens={(tls.subjectAltNames || []).filter(el => el)} />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        )}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.sni')}</FormLabel>
        {tls.sni || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      {typeof tls.insecureSkipVerify === 'boolean' ? (
        <FormItem>
          <FormLabel>{t('destination-rules.details.skip-verify')}</FormLabel>
          {tls.insecureSkipVerify
            ? t('common.statuses.true')
            : t('common.statuses.false')}
        </FormItem>
      ) : null}
    </LayoutPanel>
  );
};
