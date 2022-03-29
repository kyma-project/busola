import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { getErrorMessage } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';

export const ErrorPanel = ({ error, title, i18n }) => {
  const { t } = useTranslation(null, { i18n });
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title || 'Error'} />
      </LayoutPanel.Header>
      <LayoutPanel.Body
        style={{
          fontSize: '18px',
        }}
      >
        {getErrorMessage(error, t('components.error-panel.error'))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
