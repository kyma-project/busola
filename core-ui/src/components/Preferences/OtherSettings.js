import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'shared/components/Select/Select';
import { pageSizeSettings } from 'state/pageSizeStateAtom';
import { useRecoilState } from 'recoil';

export default function OtherSettings() {
  const { t } = useTranslation();
  const [{ pageSize, availablePageSizes }, setPageSize] = useRecoilState(
    pageSizeSettings,
  );

  const pageSizeOptions = availablePageSizes.map(s => ({
    key: s.toString(),
    text: s.toString(),
  }));

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
