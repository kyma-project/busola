import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Select, Option, Label } from '@ui5/webcomponents-react';
import {
  AVAILABLE_PAGE_SIZES,
  pageSizeAtom,
} from 'state/settings/pageSizeAtom';

export default function OtherSettings() {
  const { t } = useTranslation();

  const [pageSize, setPageSize] = useAtom(pageSizeAtom);

  const onChange = (event: any) => {
    const selectedSize = event.detail.selectedOption.value;
    setPageSize(parseInt(selectedSize));
  };

  return (
    <div className="settings-row">
      <Label for="page-size-settings" className="bsl-has-color-status-4">
        {t('settings.other.default-page-size')}
      </Label>
      <Select
        id="page-size-settings"
        accessibleName={t('settings.other.default-page-size')}
        onChange={onChange}
      >
        {AVAILABLE_PAGE_SIZES.map((available_size) => (
          <Option
            value={available_size.toString()}
            key={available_size}
            selected={pageSize === Number(available_size)}
          >
            {`${pageSize === Number(available_size) ? t('settings.other.default-last-used') : ''} ${available_size}`}
          </Option>
        ))}
        <Option
          value={Number.MAX_SAFE_INTEGER.toString()}
          key="all"
          selected={pageSize === Number.MAX_SAFE_INTEGER}
        >
          {t('settings.other.all')}
        </Option>
      </Select>
    </div>
  );
}
