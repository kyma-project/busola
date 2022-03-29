import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, FormLabel, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const OutlierDetection = ({ outlierDetection }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel className="fd-margin--md destination-rule-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('destination-rules.details.outlier-detection')}
        />
      </LayoutPanel.Header>
      {typeof outlierDetection.splitExternalLocalOriginErrors === 'boolean' ? (
        <FormItem>
          <FormLabel>{t('destination-rules.details.split-errors')}</FormLabel>
          {outlierDetection.splitExternalLocalOriginErrors
            ? t('common.statuses.true')
            : t('common.statuses.false')}
        </FormItem>
      ) : null}
      <FormItem>
        <FormLabel>
          {t('destination-rules.details.consecutive-failures')}
        </FormLabel>
        {outlierDetection.consecutiveLocalOriginFailures ||
          EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.consecutive-5xx')}</FormLabel>
        {outlierDetection.consecutive5xxErrors || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.interval')}</FormLabel>
        {outlierDetection.interval || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.base-ejection')}</FormLabel>
        {outlierDetection.baseEjectionTime || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      <FormItem>
        <FormLabel>{t('destination-rules.details.max-ejection')}</FormLabel>
        {outlierDetection.maxEjectionPercent || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>{' '}
      <FormItem>
        <FormLabel>{t('destination-rules.details.min-health')}</FormLabel>
        {outlierDetection.minHealthPercent || EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
    </LayoutPanel>
  );
};
