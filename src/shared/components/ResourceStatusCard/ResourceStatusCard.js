import { Card, CardHeader, List } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import { ExpandableListItem } from '../ExpandableListItem/ExpandableListItem';
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
          <List className="resource-status-card__conditions">
            <div
              className="title bsl-has-color-status-4 "
              style={spacing.sapUiSmallMarginBeginEnd}
            >
              {`${t('common.headers.conditions')}:`}
            </div>
            {conditions?.map((cond, index) => (
              <ExpandableListItem
                key={index}
                header={cond.header?.titleText}
                status={cond.header?.status}
                content={cond.message}
              />
            ))}
          </List>
        )}
      </Card>
    </div>
  );
}
