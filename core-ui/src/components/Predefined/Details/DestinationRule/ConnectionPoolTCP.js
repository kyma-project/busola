import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const ConnectionPoolTCP = ({ tcp }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('destination-rules.details.tcp-settings')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('destination-rules.details.max-connections')}</FormLabel>
        {tcp.maxConnections || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.connect-timeout')}</FormLabel>
        {tcp.connectTimeout || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      {tcp.tcpKeepalive ? (
        <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('destination-rules.details.tcp-alive')}
            />
          </LayoutPanel.Header>
          <FormItem>
            <FormLabel>{t('destination-rules.details.probes')}</FormLabel>
            {tcp.tcpKeepalive?.probes || EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
          <FormItem>
            <FormLabel>{t('destination-rules.details.time')}</FormLabel>
            {tcp.tcpKeepalive?.time || EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
          <FormItem>
            <FormLabel>{t('destination-rules.details.interval')}</FormLabel>
            {tcp.tcpKeepalive?.interval || EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
        </LayoutPanel>
      ) : null}
    </LayoutPanel>
  );
};
