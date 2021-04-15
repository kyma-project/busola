import React from 'react';
import { LayoutPanel, LayoutGrid } from 'fundamental-react';

import './RoleBindings.scss';

export const RoleBindings = resource => (
  <>
    <div className="fd-has-margin-m">
      <LayoutPanel key={`roleRef`}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Role" />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutGrid className={'bindings-grid'}>
            <div className="fd-has-color-status-4">Kind</div>
            <div>{resource.roleRef?.kind}</div>
            <div className="fd-has-color-status-4">Name</div>
            <div>{resource.roleRef?.name}</div>
          </LayoutGrid>
        </LayoutPanel.Body>
      </LayoutPanel>
    </div>
    <LayoutGrid cols={4} className="fd-has-margin-m">
      {resource?.subjects?.map((subject, index) => (
        <LayoutPanel key={`subject-${index}`}>
          <LayoutPanel.Header>
            <LayoutPanel.Head title="Subject" />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <LayoutGrid className={'bindings-grid'}>
              <div className="fd-has-color-status-4">Kind</div>
              <div>{subject.kind}</div>
              <div className="fd-has-color-status-4">Name</div>
              <div>{subject.name}</div>
            </LayoutGrid>
          </LayoutPanel.Body>
        </LayoutPanel>
      ))}
    </LayoutGrid>
  </>
);
