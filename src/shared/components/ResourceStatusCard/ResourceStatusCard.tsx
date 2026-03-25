import { Card, CardHeader } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ResourceStatusCard.scss';
import { ConditionItem, ConditionList } from '../ConditionList/ConditionList';
import { ReactNode } from 'react';

type ResourceStatusCardProps = {
  statusBadge: ReactNode;
  customColumns: ReactNode;
  customColumnsLong: ReactNode;
  conditions: [ConditionItem];
  customConditionsComponent: ReactNode;
};

export function ResourceStatusCard({
  statusBadge,
  customColumns,
  customColumnsLong,
  conditions,
  customConditionsComponent,
}: ResourceStatusCardProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Card
        accessibleName={t('common.headers.status')}
        header={
          <div className="resource-status-card__header">
            <CardHeader titleText={t('common.headers.status')} />
            <div className="header__status-badge">{statusBadge}</div>
          </div>
        }
        className="resource-status-card"
      >
        {customColumns && (
          <div className="resource-status-card__details-grid sap-margin-small sap-margin-top-tiny">
            {customColumns}
          </div>
        )}
        {customColumnsLong && (
          <div className="sap-margin-small sap-margin-top-tiny">
            {customColumnsLong}
          </div>
        )}
        {conditions && (
          <>
            <div
              className="title bsl-has-color-status-4 sap-margin-x-small"
              tabIndex={0}
            >
              {`${t('common.headers.conditions')}:`}
            </div>
            <ConditionList conditions={conditions} />
          </>
        )}
        {customConditionsComponent}
      </Card>
    </div>
  );
}
