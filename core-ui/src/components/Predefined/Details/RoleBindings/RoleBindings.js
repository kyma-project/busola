import React from 'react';
import { Panel, LayoutGrid } from 'fundamental-react';

import './RoleBindings.scss';

export const RoleBindings = resource => (
  <>
    <div className="fd-has-margin-m">
      <Panel key={`roleRef`}>
        <Panel.Header>
          <Panel.Head title="Role" />
        </Panel.Header>
        <Panel.Body>
          <LayoutGrid className={'bindings-grid'}>
            <div className="fd-has-color-status-4">Kind</div>
            <div>{resource.roleRef?.kind}</div>
            <div className="fd-has-color-status-4">Name</div>
            <div>{resource.roleRef?.name}</div>
          </LayoutGrid>
        </Panel.Body>
      </Panel>
    </div>
    <LayoutGrid cols={4} className="fd-has-margin-m">
      {resource?.subjects?.map((subject, index) => (
        <Panel key={`subject-${index}`}>
          <Panel.Header>
            <Panel.Head title="Subject" />
          </Panel.Header>
          <Panel.Body>
            <LayoutGrid className={'bindings-grid'}>
              <div className="fd-has-color-status-4">Kind</div>
              <div>{subject.kind}</div>
              <div className="fd-has-color-status-4">Name</div>
              <div>{subject.name}</div>
            </LayoutGrid>
          </Panel.Body>
        </Panel>
      ))}
    </LayoutGrid>
  </>
);
