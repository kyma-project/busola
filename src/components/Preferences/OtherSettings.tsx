import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Select, Option } from '@ui5/webcomponents-react';
import { pageSizeState } from 'state/preferences/pageSizeAtom';
const AVAILABLE_PAGE_SIZES = [10, 20, 50];

export default function OtherSettings() {
  const { t } = useTranslation();

  const [pageSize, setPageSize] = useRecoilState(pageSizeState);

  const onChange = (event: any) => {
    const selectedSize = event.detail.selectedOption.value;
    setPageSize(parseInt(selectedSize));
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.other.default-page-size')}
      </span>
      <Select onChange={onChange}>
        {AVAILABLE_PAGE_SIZES.map(available_size => (
          <Option
            value={available_size.toString()}
            selected={pageSize.toString() === available_size.toString()}
          >
            {available_size.toString()}
          </Option>
        ))}
      </Select>
    </div>
  );
}
