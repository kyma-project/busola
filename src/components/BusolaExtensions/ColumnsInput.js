import { useTranslation } from 'react-i18next';
import { CheckBox, MessageStrip } from '@ui5/webcomponents-react';
import { FormInput } from 'fundamental-react';

export function ColumnsInput({ value: columns, setValue: setColumns }) {
  const { t } = useTranslation();

  if (!columns?.length) {
    return (
      <MessageStrip design="Warning" hideCloseButton>
        {t('extensibility.starter-modal.messages.no-columns')}
      </MessageStrip>
    );
  }

  return columns.map(value => {
    return (
      <div key={value.path} className="columns-input">
        <CheckBox
          checked={value.isSelected}
          onChange={e => {
            value.isSelected = e.target.checked;
            setColumns([...columns]);
          }}
        />
        <FormInput
          compact
          value={value.name}
          onChange={e => {
            value.name = e.target.value;
            setColumns([...columns]);
          }}
          required
          placeholder={t('extensibility.starter-modal.headers.field-name')}
          readOnly={!value.isSelected}
        />
        <FormInput readOnly compact defaultValue={value?.path} />
        <FormInput readOnly compact defaultValue={value?.type} />
      </div>
    );
  });
}
