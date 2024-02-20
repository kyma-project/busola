import { useTranslation } from 'react-i18next';
import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';

export function ModeSelector({ mode, isEditing, setMode }) {
  const { t } = useTranslation();

  const buttonsToDisplay = [
    {
      mode: ModeSelector.MODE_FORM,
      label: t('common.create-form.modes.form'),
    },
    {
      mode: ModeSelector.MODE_YAML,
      label: t('common.create-form.modes.yaml'),
    },
  ];

  return (
    <div className="ui5-content-density-compact">
      <SegmentedButton>
        {buttonsToDisplay.map(button => (
          <SegmentedButtonItem
            key={button.mode}
            pressed={mode === button.mode}
            onClick={() => setMode(button.mode)}
          >
            {button.label}
          </SegmentedButtonItem>
        ))}
      </SegmentedButton>
    </div>
  );
}

ModeSelector.MODE_FORM = 'MODE_FORM';
ModeSelector.MODE_YAML = 'MODE_YAML';
