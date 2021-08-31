import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import './RoleBindings.scss';

export const RoleBindings = resource => {
  const { t } = useTranslation();
  return (
    <React.Fragment key="role-bindings">
      <div className="fd-margin--md">
        <LayoutPanel key={`roleRef`}>
          <LayoutPanel.Header>
            <LayoutPanel.Head title="Role" />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <div className={'bindings-grid'}>
              <div className="fd-has-color-status-4">
                {t('role-bindings.headers.kind')}
              </div>
              <div>{resource.roleRef?.kind}</div>
              <div className="fd-has-color-status-4">
                {t('common.headers.name')}
              </div>
              <div>{resource.roleRef?.name}</div>
            </div>
          </LayoutPanel.Body>
        </LayoutPanel>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gridGap: '1rem',
        }}
        className="fd-margin--md"
      >
        {resource?.subjects?.map((subject, index) => (
          <LayoutPanel key={`subject-${index}`}>
            <LayoutPanel.Header>
              <LayoutPanel.Head title="Subject" />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <div className={'bindings-grid'}>
                <div className="fd-has-color-status-4">
                  {t('role-bindings.headers.kind')}
                </div>
                <div>{subject.kind}</div>
                <div className="fd-has-color-status-4">
                  {t('common.headers.name')}
                </div>
                <div>{subject.name}</div>
              </div>
            </LayoutPanel.Body>
          </LayoutPanel>
        ))}
      </div>
    </React.Fragment>
  );
};
