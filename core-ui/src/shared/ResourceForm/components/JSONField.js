import React, { useEffect, useState } from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ControlledEditor, useTheme } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

export function EditorField({
  value,
  setValue,
  validate,
  invalidValueMessage,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isValueParseable, setValueParseable] = useState(true);
  const [isValueValid, setValueValid] = useState(true);
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => setEditorValue(JSON.stringify(value)), [value]);

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
      setValue(JSON.parse(value));
    } else {
      setValueValid(false);
    }
  };

  return (
    <>
      <ControlledEditor
        height="12em"
        language="json"
        theme={theme}
        value={editorValue}
        onChange={onEditorChange}
      />
      {(!isValueParseable || !isValueValid) && (
        <MessageStrip type="warning">
          {!isValueParseable
            ? t('common.messages.parse-error')
            : invalidValueMessage}
        </MessageStrip>
      )}
    </>
  );
}
