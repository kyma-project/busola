import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';

const DistributeWidget = ({ distribute }) => {
  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('destination-rules.details.from'),
    t('destination-rules.details.to'),
  ];
  const rowRenderer = entry => [
    entry.from,
    <Tokens
      tokens={Object.entries(entry.to)
        .filter(el => el)
        .map(([key, value]) => `${key}: ${value}`)}
    />,
  ];
  return (
    <GenericList
      className="destination-rule-refs-panel"
      title={t('destination-rules.details.distribution')}
      entries={distribute}
      textSearchProperties={['from']}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="dr-distribution-rules"
      i18n={i18n}
    />
  );
};
const FailoverWidget = ({ failover }) => {
  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('destination-rules.details.from'),
    t('destination-rules.details.to'),
  ];
  const rowRenderer = entry => [entry.from, entry.to];
  return (
    <GenericList
      className="destination-rule-refs-panel"
      title={t('destination-rules.details.failover')}
      textSearchProperties={['from']}
      entries={failover}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="dr-failover-rules"
      i18n={i18n}
    />
  );
};

export const LoadBalancer = ({ loadBalancer }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('destination-rules.details.load-balancer')}
        />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('destination-rules.details.simple')}</FormLabel>
        {loadBalancer.simple || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      {loadBalancer.consistentHash ? (
        <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('destination-rules.details.consistent-hash')}
            />
          </LayoutPanel.Header>
          <FormItem>
            <FormLabel>{t('destination-rules.details.http-header')}</FormLabel>
            {loadBalancer.consistentHash?.httpHeaderName ||
              EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
          {typeof loadBalancer.consistentHash?.useSourceIp === 'boolean' ? (
            <FormItem>
              <FormLabel>{t('destination-rules.details.source-ip')}</FormLabel>
              {loadBalancer.consistentHash?.useSourceIp
                ? t('common.statuses.true')
                : t('common.statuses.false')}
            </FormItem>
          ) : null}
          <FormItem>
            <FormLabel>
              {t('destination-rules.details.http-query-parameter')}
            </FormLabel>
            {loadBalancer.consistentHash?.httpQueryParameterName ||
              EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
          <FormItem>
            <FormLabel>
              {t('destination-rules.details.minimum-ring-size')}
            </FormLabel>
            {loadBalancer.consistentHash?.minimumRingSize ||
              EMPTY_TEXT_PLACEHOLDER}
          </FormItem>
          {loadBalancer.consistentHash?.httpCookie ? (
            <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('destination-rules.details.http-cookie')}
                />
              </LayoutPanel.Header>
              <FormItem>
                <FormLabel>{t('common.labels.name')}</FormLabel>
                {loadBalancer.consistentHash?.httpCookie?.name ||
                  EMPTY_TEXT_PLACEHOLDER}
              </FormItem>
              <FormItem>
                <FormLabel>{t('common.labels.path')}</FormLabel>
                {loadBalancer.consistentHash?.httpCookie?.path ||
                  EMPTY_TEXT_PLACEHOLDER}
              </FormItem>
              <FormItem>
                <FormLabel>{t('destination-rules.details.ttl')}</FormLabel>
                {loadBalancer.consistentHash?.httpCookie?.ttl ||
                  EMPTY_TEXT_PLACEHOLDER}
              </FormItem>
            </LayoutPanel>
          ) : null}
        </LayoutPanel>
      ) : null}

      {loadBalancer.localityLbSetting ? (
        <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('destination-rules.details.lb-settings')}
            />
          </LayoutPanel.Header>
          {typeof loadBalancer.localityLbSetting?.enabled === 'boolean' ? (
            <FormItem>
              <FormLabel>{t('destination-rules.details.enabled')}</FormLabel>
              {loadBalancer.localityLbSetting?.enabled
                ? t('common.statuses.true')
                : t('common.statuses.false')}
            </FormItem>
          ) : null}
          {loadBalancer.localityLbSetting?.distribute ? (
            <DistributeWidget
              distribute={loadBalancer.localityLbSetting?.distribute}
            />
          ) : null}
          {loadBalancer.localityLbSetting?.failover ? (
            <FailoverWidget
              failover={loadBalancer.localityLbSetting?.failover}
            />
          ) : null}
          {loadBalancer.localityLbSetting?.failoverPriority ? (
            <FormItem>
              <FormLabel>
                {t('destination-rules.details.failover-priority')}
              </FormLabel>
              <Tokens
                tokens={loadBalancer.localityLbSetting?.failoverPriority.filter(
                  el => el,
                )}
              />
            </FormItem>
          ) : null}
        </LayoutPanel>
      ) : null}
    </LayoutPanel>
  );
};
