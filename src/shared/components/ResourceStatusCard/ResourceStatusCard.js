import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Icon,
  List,
  StandardListItem,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import './ResourceStatusCard.scss';

export function ResourceStatusCard({ statusBadge, customColumns, conditions }) {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState(null);

  const togglePanel = number => {
    setExpandedPanel(expandedPanel === number ? null : number);
  };

  return (
    <div style={spacing.sapUiSmallMarginBeginEnd}>
      <Card
        header={
          <div
            className="resource-status-card__header"
            style={spacing.sapUiTinyMarginTop}
          >
            <CardHeader titleText={t('common.headers.status')} />
            <div className="header__status-badge">{statusBadge}</div>
          </div>
        }
        className="resource-status-card"
      >
        <div
          style={{
            ...spacing.sapUiTinyMarginTopBottom,
            ...spacing.sapUiSmallMarginBeginEnd,
          }}
          className="resource-status-card__details-grid"
        >
          {customColumns}
        </div>
        {conditions && (
          <List className="resource-status-card__conditions">
            <div
              className="title bsl-has-color-status-4 "
              style={spacing.sapUiSmallMarginBeginEnd}
            >
              {`${t('common.headers.conditions')}:`}
            </div>
            {conditions?.map((cond, number) => (
              <>
                <StandardListItem
                  onClick={() => togglePanel(number)}
                  className="conditions-element"
                >
                  <div className="conditions-header">
                    {expandedPanel === number ? (
                      <Icon
                        name="slim-arrow-down"
                        design="Information"
                        style={spacing.sapUiTinyMarginEnd}
                      />
                    ) : (
                      <Icon
                        name="slim-arrow-right"
                        design="Information"
                        style={spacing.sapUiTinyMarginEnd}
                      />
                    )}
                    {cond.header.titleText}
                    <StatusBadge
                      type={cond.header.status ? 'Success' : 'Error'}
                      className={'conditions-header__status-badge'}
                    >
                      {cond.header.status}
                    </StatusBadge>
                  </div>
                </StandardListItem>
                {expandedPanel === number && (
                  <div
                    className="conditions-message"
                    style={{
                      ...spacing.sapUiSmallMarginBeginEnd,
                      ...spacing.sapUiTinyMarginTopBottom,
                    }}
                  >
                    <div className="title bsl-has-color-status-4 ">
                      {`${t('common.headers.message')}:`}
                    </div>
                    {cond.message}
                  </div>
                )}
              </>
            ))}
          </List>
        )}
      </Card>
    </div>
  );
}
