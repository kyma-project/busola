import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const ConnectionPoolHTTP = ({ http }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('destination-rules.details.http-settings')}
        />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('destination-rules.details.http-pending')}</FormLabel>
        {http.http1MaxPendingRequests || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.http-max')}</FormLabel>
        {http.http2MaxRequests || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>
          {t('destination-rules.details.max-per-connection')}
        </FormLabel>
        {http.maxRequestsPerConnection || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.max-retries')}</FormLabel>
        {http.maxRetries || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.idle-timeout')}</FormLabel>
        {http.idleTimeout || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.h2-upgrade')}</FormLabel>
        {http.h2UpgradePolicy || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      {typeof http.useClientProtocol === 'boolean' ? (
        <FormItem>
          <FormLabel>
            {t('destination-rules.details.client-protocol')}
          </FormLabel>
          {http.useClientProtocol
            ? t('common.statuses.true')
            : t('common.statuses.false')}
        </FormItem>
      ) : null}
    </LayoutPanel>
  );
};
