import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSegmented } from 'fundamental-react';
import './ModeSelector.scss';

export function ModeSelector({ mode, isEditing, setMode }) {
  const { t } = useTranslation();

  const createModeButtons = [
    {
      mode: ModeSelector.MODE_SIMPLE,
      label: t('common.create-form.modes.simple'),
    },
    {
      mode: ModeSelector.MODE_ADVANCED,
      label: t('common.create-form.modes.advanced'),
    },
    { mode: ModeSelector.MODE_YAML, label: 'YAML' },
  ];

  const editeModeButtons = [
    {
      mode: ModeSelector.MODE_ADVANCED,
      label: t('common.create-form.modes.ui-form'),
    },
    { mode: ModeSelector.MODE_YAML, label: 'YAML' },
  ];

  const buttonsToDisplay = isEditing ? editeModeButtons : createModeButtons;

  return (
    <div className="mode-selector">
      <ButtonSegmented>
        {buttonsToDisplay.map(button => (
          <Button
            compact
            key={button.mode}
            selected={mode === button.mode}
            onClick={() => setMode(button.mode)}
          >
            {button.label}
          </Button>
        ))}
      </ButtonSegmented>
    </div>
  );
}

ModeSelector.MODE_SIMPLE = 'MODE_SIMPLE';
ModeSelector.MODE_ADVANCED = 'MODE_ADVANCED';
ModeSelector.MODE_YAML = 'MODE_YAML';
