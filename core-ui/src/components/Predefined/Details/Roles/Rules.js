import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import './Rules.scss';

export const Rules = resource => {
  const { t } = useTranslation();
  return (
    <div
      key="rules"
      style={{
        display: 'grid',
        gridTemplateColumns:
          'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
        gridGap: '1rem',
      }}
      className="fd-margin--md"
    >
      {resource?.rules?.map((rule, index) => (
        <LayoutPanel key={`rule-${index}`}>
          <LayoutPanel.Header>
            <LayoutPanel.Head title="Rule" />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <div className={'rules-grid'}>
              <div className="fd-has-color-status-4">
                {t('roles.headers.api-groups')}
              </div>
              <div>{rule.apiGroups?.join(', ') || '""'}</div>
              <div className="fd-has-color-status-4">
                {t('roles.headers.resources')}
              </div>
              <div>{rule.resources?.join(', ')}</div>
              <div className="fd-has-color-status-4">
                {t('roles.headers.verbs')}
              </div>
              <div>{rule.verbs?.join(', ')}</div>
            </div>
          </LayoutPanel.Body>
        </LayoutPanel>
      ))}
    </div>
  );
};
