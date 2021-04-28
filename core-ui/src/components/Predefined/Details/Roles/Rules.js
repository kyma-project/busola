import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import './Rules.scss';

export const Rules = resource => (
  <div
    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
    className="fd-margin--md"
  >
    {resource?.rules?.map((rule, index) => (
      <LayoutPanel key={`rule-${index}`}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Rule" />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <div className={'rules-grid'}>
            <div className="fd-has-color-status-4">API Groups</div>
            <div>{rule.apiGroups?.join(', ') || '""'}</div>
            <div className="fd-has-color-status-4">Resources</div>
            <div>{rule.resources?.join(', ')}</div>
            <div className="fd-has-color-status-4">Verbs</div>
            <div>{rule.verbs?.join(', ')}</div>
          </div>
        </LayoutPanel.Body>
      </LayoutPanel>
    ))}
  </div>
);
