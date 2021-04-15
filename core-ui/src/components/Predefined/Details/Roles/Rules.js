import React from 'react';
import { LayoutPanel, LayoutGrid } from 'fundamental-react';

import './Rules.scss';

export const Rules = resource => (
  <LayoutGrid cols={4} className="fd-has-margin-m">
    {resource?.rules?.map((rule, index) => (
      <LayoutPanel key={`rule-${index}`}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Rule" />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutGrid className={'rules-grid'}>
            <div className="fd-has-color-status-4">API Groups</div>
            <div>{rule.apiGroups?.join(', ') || '""'}</div>
            <div className="fd-has-color-status-4">Resources</div>
            <div>{rule.resources?.join(', ')}</div>
            <div className="fd-has-color-status-4">Verbs</div>
            <div>{rule.verbs?.join(', ')}</div>
          </LayoutGrid>
        </LayoutPanel.Body>
      </LayoutPanel>
    ))}
  </LayoutGrid>
);
