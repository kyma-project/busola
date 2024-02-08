import { Card, CardHeader, Panel } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import './ResourceStatusCard.scss';

export function ResourceStatusCard({ statusBadge, customColumns, conditions }) {
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
        <div
          style={spacing.sapUiSmallMargin}
          className="resource-status-card__details-grid"
        >
          {customColumns}
        </div>
        {conditions && (
          <div style={spacing.sapUiSmallMargin}>
            <div className="title bsl-has-color-status-4 ">Conditions:</div>
            {conditions?.map(cond => (
              <Panel
                key={cond.header.titleText}
                header={
                  <div className="resource-status-card__conditions-header">
                    {cond.header.titleText}
                    <StatusBadge
                      type={cond.header.status ? 'Success' : 'Error'}
                      className={'conditions-header__status-badge'}
                    >
                      {cond.header.status}
                    </StatusBadge>
                  </div>
                }
                collapsed
                style={spacing.sapUiSmallMarginTop}
              >
                {cond.message}
              </Panel>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
