import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { ControlledEditor, useTheme } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { useTranslation } from 'react-i18next';

export const isObject = value =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export function JSONSection({
  title,
  value,
  setValue,
  invalidValueMessage,
  validate = isObject,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isValueParseable, setValueParseable] = React.useState(true);
  const [isValueValid, setValueValid] = React.useState(true);
  const [editorValue, setEditorValue] = React.useState(value);

  React.useEffect(() => setEditorValue(value), [value]);

  const isValid = value => {
    try {
      const parsed = JSON.parse(value);
      setValueParseable(true);
      return validate(parsed);
    } catch (_) {
      setValueParseable(false);
      return false;
    }
  };

  const onEditorChange = (_, value) => {
    setEditorValue(value);
    if (isValid(value)) {
      setValueValid(true);
      setValue(value);
    } else {
      setValueValid(false);
    }
  };

  const actions = (!isValueParseable || !isValueValid) && (
    <MessageStrip type="warning">
      {!isValueParseable
        ? t('common.messages.parse-error')
        : invalidValueMessage}
    </MessageStrip>
  );

  return (
    <CreateForm.CollapsibleSection title={title} actions={actions}>
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
