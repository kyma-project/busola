import { useTranslation } from 'react-i18next';
import { CheckBox, Input, MessageStrip } from '@ui5/webcomponents-react';

interface Column {
  path?: string;
  isSelected: boolean;
  type: string;
  name: string;
  required?: boolean;
  widget?: boolean;
  source?: string;
}

interface ColumnsInputProps {
  value: Column[];
  setValue: (columns: Column[]) => void;
}

export function ColumnsInput({
  value: columns,
  setValue: setColumns,
}: ColumnsInputProps) {
  const { t } = useTranslation();

  if (!columns?.length) {
    return (
      <MessageStrip design="Critical" hideCloseButton>
        {t('extensibility.starter-modal.messages.no-columns')}
      </MessageStrip>
    );
  }

  return columns.map((value) => {
    return (
      <div key={value.path} className="columns-input">
        <CheckBox
          data-testid={value?.path}
          checked={value.isSelected}
          onChange={(e) => {
            value.isSelected = e.target.checked;
            setColumns([...columns]);
          }}
          accessibleName={`Checkbox ${value.name}`}
        />
        <Input
          value={value.name}
          onInput={(e) => {
            value.name = e.target.value;
            setColumns([...columns]);
          }}
          className="full-width"
          required
          placeholder={t('extensibility.starter-modal.headers.field-name')}
          disabled={!value.isSelected ? true : false}
          accessibleName={t('common.labels.name')}
        />
        <Input
          className="full-width"
          disabled
          value={value?.path}
          accessibleName={t('common.labels.path')}
        />
        <Input
          className="full-width"
          disabled
          value={value?.type}
          accessibleName={t('common.labels.type')}
        />
      </div>
    );
  });
}
