import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { ControlledEditor, useTheme } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { useTranslation } from 'react-i18next';

export function JSONSection({ title, value, setValue, validate }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [areParamsValid, setParamsValid] = React.useState(true);

  const isParseableToObject = value => {
    try {
      const parsed = JSON.parse(value);
      return validate(parsed);
    } catch (_) {
      return false;
    }
  };

  const onEditorChange = (_, value) => {
    if (isParseableToObject(value)) {
      setValue(value);
      setParamsValid(true);
    } else {
      setParamsValid(false);
    }
  };

  return (
    <CreateModal.CollapsibleSection
      title={title}
      actions={
        !areParamsValid && (
          <MessageStrip type="warning">
            {t('common.messages.parse-error')}
          </MessageStrip>
        )
      }
    >
      <ControlledEditor
        height="12em"
        language="json"
        theme={theme}
        value={value}
        onChange={onEditorChange}
      />
    </CreateModal.CollapsibleSection>
  );
}
