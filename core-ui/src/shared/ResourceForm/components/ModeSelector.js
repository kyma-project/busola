import React from 'react';
import { Button, ButtonSegmented } from 'fundamental-react';
import './ModeSelector.scss';
import { useTranslation } from 'react-i18next';

export function ModeSelector({ mode, setMode, withoutYaml }) {
  const { t } = useTranslation();

  const modeButtons = !withoutYaml
    ? [
        {
          mode: ModeSelector.MODE_SIMPLE,
          label: t('common.create-form.modes.simple'),
        },
        {
          mode: ModeSelector.MODE_ADVANCED,
          label: t('common.create-form.modes.advanced'),
        },
        { mode: ModeSelector.MODE_YAML, label: 'YAML' },
      ]
    : [
        {
          mode: ModeSelector.MODE_SIMPLE,
          label: t('common.create-form.modes.simple'),
        },
        {
          mode: ModeSelector.MODE_ADVANCED,
          label: t('common.create-form.modes.advanced'),
        },
      ];

  return (
    <div className="mode-selector">
      <ButtonSegmented>
        {modeButtons.map(button => (
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
