import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { ControlledEditor, useTheme } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { useTranslation } from 'react-i18next';

const isNonEmptyObject = value => !!value && typeof value === 'object';

export function JSONSection({
  title,
  value,
  setValue,
  validate = isNonEmptyObject,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [areParamsValid, setParamsValid] = React.useState(true);

  const isValid = value => {
    try {
      const parsed = JSON.parse(value);
      return validate(parsed);
    } catch (_) {
      return false;
    }
  };

  const onEditorChange = (_, value) => {
    if (isValid(value)) {
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
