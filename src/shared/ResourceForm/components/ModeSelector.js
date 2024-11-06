import { useTranslation } from 'react-i18next';
import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import {
  editViewModeState,
  getEditViewModeState,
} from 'state/preferences/editViewModeAtom';

export function ModeSelector({ mode, setMode, isDisabled = false }) {
  const { t } = useTranslation();
  const [editViewMode, setEditViewMode] = useRecoilState(editViewModeState);
  const { preferencesViewType } = getEditViewModeState(editViewMode);

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
    <div className="ui5-content-density-compact mode-selector">
      <SegmentedButton
        className="mode-selector__content"
        onSelectionChange={event => {
          const mode = event.detail.selectedItem.getAttribute('data-mode');
          setMode(mode);
          if (preferencesViewType === 'MODE_DEFAULT') {
            setEditViewMode({
              preferencesViewType: preferencesViewType,
              dynamicViewType: mode,
            });
          }
        }}
      >
        {buttonsToDisplay.map(button => (
          <SegmentedButtonItem
            key={button.mode}
            selected={mode === button.mode}
            disabled={isDisabled}
            data-mode={button.mode}
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
