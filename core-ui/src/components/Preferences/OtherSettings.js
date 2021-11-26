import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Select } from 'shared/components/Select/Select';

export default function OtherSettings() {
  const { t } = useTranslation();
  const { settings } = useMicrofrontendContext();
  const { pageSize, AVAILABLE_PAGE_SIZES } = settings.pagination;

  const pageSizeOptions = AVAILABLE_PAGE_SIZES.map(s => ({
    key: s.toString(),
    text: s.toString(),
  }));

  const setPageSize = pageSize => {
    LuigiClient.sendCustomMessage({
      id: 'busola.set-page-size',
      pageSize,
    });
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.other.default-page-size')}
      </span>
      <Select
        options={pageSizeOptions}
        selectedKey={pageSize.toString()}
        onSelect={(_, { key }) => setPageSize(parseInt(key))}
      />
    </div>
  );
}
