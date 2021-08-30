import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { ControlledEditor, useTheme } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { useTranslation } from 'react-i18next';

export const isObject = value =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export function JSONSection({ title, value, setValue, validate = isObject }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [areParamsValid, setParamsValid] = React.useState(true);
  const [editorValue, setEditorValue] = React.useState(value);

  React.useEffect(() => setEditorValue(value), [value]);

  const isValid = value => {
    try {
      const parsed = JSON.parse(value);
      return validate(parsed);
    } catch (_) {
      return false;
    }
  };

  const onEditorChange = (_, value) => {
    setEditorValue(value);
    if (isValid(value)) {
      setParamsValid(true);
      setValue(value);
    } else {
      setParamsValid(false);
    }
  };

  return (
    <CreateForm.CollapsibleSection
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
        value={editorValue}
        onChange={onEditorChange}
      />
    </CreateForm.CollapsibleSection>
  );
}
