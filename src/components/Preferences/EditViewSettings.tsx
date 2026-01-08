import { Label, Option, Select } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import {
  editViewModeAtom,
  getEditViewModeState,
} from 'state/preferences/editViewModeAtom';

const AVAILABLE_EDIT_VIEW_OPTIONS = [
  { key: 'MODE_YAML', text: 'always-yaml' },
  { key: 'MODE_FORM', text: 'always-form' },
  { key: 'MODE_DEFAULT', text: 'default' },
];

export default function EditViewSettings() {
  const { t } = useTranslation();
  const [editViewMode, setEditViewMode] = useAtom(editViewModeAtom);

  const { preferencesViewType } = getEditViewModeState(editViewMode);

  return (
    <>
      <div className="preferences-row">
        <Label for="editTypeComboBox" className="bsl-has-color-status-4">
          {t('settings.general.edit-view.choose')}
        </Label>
        <Select
          id="editTypeComboBox"
          accessibleName={t('settings.general.edit-view.choose')}
          onChange={(e) => {
            setEditViewMode({
              preferencesViewType: e.target.value ?? 'MODE_DEFAULT',
              dynamicViewType:
                e.target.value === 'MODE_DEFAULT' ? 'MODE_FORM' : null,
            });
          }}
        >
          {AVAILABLE_EDIT_VIEW_OPTIONS.map((available_option, index) => (
            <Option
              key={index}
              value={available_option.key}
              selected={preferencesViewType === available_option.key}
            >
              {t(`settings.general.edit-view.${available_option.text}`)}
            </Option>
          ))}
        </Select>
      </div>
    </>
  );
}
