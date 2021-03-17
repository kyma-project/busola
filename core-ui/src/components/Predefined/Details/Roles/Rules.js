import React from 'react';
import { Panel, LayoutGrid } from 'fundamental-react';

import './Rules.scss';

export const Rules = resource => (
  <LayoutGrid cols={3} className="fd-has-margin-m">
    {resource?.rules?.map((rule, index) => (
      <Panel key={`rule-${index}`}>
        <Panel.Header>
          <Panel.Head title="Rule" />
        </Panel.Header>
        <Panel.Body>
          <LayoutGrid className={'rules-grid'}>
            <div className="fd-has-color-status-4">API Groups</div>
            <div>{rule.apiGroups?.join(', ') || '""'}</div>
            <div className="fd-has-color-status-4">Resources</div>
            <div>{rule.resources?.join(', ')}</div>
            <div className="fd-has-color-status-4">Verbs</div>
            <div>{rule.verbs?.join(', ')}</div>
          </LayoutGrid>
        </Panel.Body>
      </Panel>
    ))}
  </LayoutGrid>
);
