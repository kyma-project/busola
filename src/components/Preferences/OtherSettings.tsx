import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Select, Option } from '@ui5/webcomponents-react';
import {
  AVAILABLE_PAGE_SIZES,
  pageSizeState,
} from 'state/preferences/pageSizeAtom';

export default function OtherSettings() {
  const { t } = useTranslation();

  const [pageSize, setPageSize] = useRecoilState(pageSizeState);

  const onChange = (event: any) => {
    const selectedSize = event.detail.selectedOption.value;
    setPageSize(parseInt(selectedSize));
  };

  return (
    <div className="preferences-row">
      <span className="bsl-has-color-status-4">
        {t('settings.other.default-page-size')}
      </span>
      <Select onChange={onChange}>
        {AVAILABLE_PAGE_SIZES.map(available_size => (
          <Option
            value={available_size.toString()}
            key={available_size}
            selected={pageSize === Number(available_size)}
          >
            {available_size}
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
