import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'shared/components/Select/Select';
import { pageSizeState } from 'state/pageSizeStateAtom';
import { useRecoilState } from 'recoil';
const AVAILABLE_PAGE_SIZES = [10, 20, 50];

export default function OtherSettings() {
  const { t } = useTranslation();

  const [pageSize, setPageSize] = useRecoilState(pageSizeState);

  const pageSizeOptions = AVAILABLE_PAGE_SIZES.map(s => ({
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
