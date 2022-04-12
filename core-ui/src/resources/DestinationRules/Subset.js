import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { Tokens } from 'shared/components/Tokens';
import { TrafficPolicyWidget } from './TrafficPolicy';

export const Subset = destinationRule => {
  const { t } = useTranslation();
  return destinationRule.spec?.subsets ? (
    <LayoutPanel
      className="fd-margin--md destination-rule-refs-panel"
      key={'destination-rules-subsets'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('destination-rules.details.subsets')} />
      </LayoutPanel.Header>
      {destinationRule.spec.subsets.map(subset => (
        <LayoutPanel
          className="fd-margin--md destination-rule-refs-panel"
          key={subset.name}
        >
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={`${t('destination-rules.details.subset')}: ${subset.name}`}
            />
          </LayoutPanel.Header>
          <FormItem>
            <FormLabel>{t('common.headers.labels')}</FormLabel>
            <Tokens
              tokens={Object.entries(subset.labels)
                .filter(el => el)
                .map(([key, value]) => `${key}: ${value}`)}
            />
          </FormItem>
          <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
            <LayoutPanel.Header>
              <LayoutPanel.Head
                title={t('destination-rules.details.traffic-policy')}
              />
            </LayoutPanel.Header>
            <TrafficPolicyWidget trafficPolicy={subset.trafficPolicy} />
          </LayoutPanel>
        </LayoutPanel>
      ))}
    </LayoutPanel>
  ) : null;
};
