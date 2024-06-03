import { Card, CardHeader } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import './ResourceStatusCard.scss';
import { ConditionList } from '../ConditionList/ConditionList';
import React from 'react';

export function ResourceStatusCard({
  statusBadge,
  customColumns,
  conditions,
  customStatusComponents,
  customConditionsComponent,
}) {
  const { t } = useTranslation();

  return (
    <div style={spacing.sapUiSmallMarginBeginEnd}>
      <Card
        header={
          <div className="resource-status-card__header">
            <CardHeader titleText={t('common.headers.status')} />
            <div className="header__status-badge">{statusBadge}</div>
          </div>
        }
        className="resource-status-card"
      >
        {customColumns && (
          <div
            style={{
              ...spacing.sapUiSmallMargin,
              ...spacing.sapUiTinyMarginTop,
            }}
            className="resource-status-card__details-grid"
          >
            {customColumns}
          </div>
        )}
        {conditions && (
          <>
            <div
              className="title bsl-has-color-status-4 "
              style={spacing.sapUiSmallMarginBeginEnd}
            >
              {t('common.headers.conditions')}
            </div>
            <ConditionList conditions={conditions} />
          </>
        )}

        {customStatusComponents && (
          <div
            style={{
              ...spacing.sapUiSmallMargin,
              ...spacing.sapUiTinyMarginTop,
            }}
            className="resource-status-card__details-grid"
          >
            {customStatusComponents}
          </div>
        )}
        {customConditionsComponent && customConditionsComponent}
      </Card>
    </div>
  );
}
