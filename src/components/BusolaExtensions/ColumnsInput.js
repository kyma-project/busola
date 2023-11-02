import { useTranslation } from 'react-i18next';
import { CheckBox, Input, MessageStrip } from '@ui5/webcomponents-react';

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
        <Input
          value={value.name}
          onInput={e => {
            value.name = e.target.value;
            setColumns([...columns]);
          }}
          className="full-width"
          required
          placeholder={t('extensibility.starter-modal.headers.field-name')}
          disabled={!value.isSelected ? true : false}
        />
        <Input className="full-width" disabled value={value?.path} />
        <Input className="full-width" disabled value={value?.type} />
      </div>
    );
  });
}
