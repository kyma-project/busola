import React from 'react';
import { getErrorMessage } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from '../UI5Panel/UI5Panel';

export const ErrorPanel = ({ error, title }) => {
  const { t } = useTranslation();

  return (
    <UI5Panel title={title || 'Error'}>
      <div
        style={{
          fontSize: '18px',
        }}
      >
        {getErrorMessage(error, t('components.error-panel.error'))}
      </div>
    </UI5Panel>
  );
};
