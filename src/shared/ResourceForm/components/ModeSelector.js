import { useTranslation } from 'react-i18next';
import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';

export function ModeSelector({
  mode,
  isEditing,
  setMode,
  isDisabled = false,
  noAdvancedMode = false,
}) {
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

  const editModeButtons = [
    {
      mode: ModeSelector.MODE_ADVANCED,
      label: t('common.create-form.modes.ui-form'),
    },
    { mode: ModeSelector.MODE_YAML, label: 'YAML' },
  ];

  const buttonsToDisplay =
    isEditing || noAdvancedMode ? editModeButtons : createModeButtons;

  return (
    <div className="ui5-content-density-compact mode-selector">
      <SegmentedButton className="mode-selector__content">
        {buttonsToDisplay.map(button => (
          <SegmentedButtonItem
            key={button.mode}
            pressed={mode === button.mode}
            onClick={() => setMode(button.mode)}
            disabled={isDisabled}
          >
            {button.label}
          </SegmentedButtonItem>
        ))}
      </SegmentedButton>
    </div>
  );
}

ModeSelector.MODE_SIMPLE = 'MODE_SIMPLE';
ModeSelector.MODE_ADVANCED = 'MODE_ADVANCED';
ModeSelector.MODE_YAML = 'MODE_YAML';
