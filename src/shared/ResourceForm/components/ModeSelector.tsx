import { useTranslation } from 'react-i18next';
import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';
import { useAtom } from 'jotai';
import {
  editViewModeAtom,
  EditViewTypes,
  getEditViewModeState,
} from 'state/settings/editViewModeAtom';

type ModeSelectorProps = {
  mode: string;
  setMode: (mode: string) => void;
  isDisabled?: boolean;
};

export function ModeSelector({
  mode,
  setMode,
  isDisabled = false,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  const [editViewMode, setEditViewMode] = useAtom(editViewModeAtom);
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
        onSelectionChange={(event) => {
          const mode = event.detail.selectedItems[0].getAttribute(
            'data-mode',
          ) as EditViewTypes['dynamicViewType'];
          setMode(mode as string);
          if (preferencesViewType === 'MODE_DEFAULT') {
            setEditViewMode({
              preferencesViewType: preferencesViewType,
              dynamicViewType: mode,
            });
          }
        }}
      >
        {buttonsToDisplay.map((button) => (
          <SegmentedButtonItem
            className="min-width-button"
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
