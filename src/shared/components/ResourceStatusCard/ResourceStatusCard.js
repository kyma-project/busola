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
            {conditions?.map(cond => (
              <ExpandableListItem
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

const ExpandableListItem = ({ header, status, content }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <StandardListItem
        onClick={() => setExpanded(!expanded)}
        className="conditions-element"
      >
        <div className="conditions-header">
          {expanded ? (
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
          {header}
          <StatusBadge
            type={status === 'True' ? 'Success' : 'Error'}
            className={'conditions-header__status-badge'}
          >
            {status}
          </StatusBadge>
        </div>
      </StandardListItem>
      {expanded && (
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
          {content}
        </div>
      )}
    </>
  );
};
