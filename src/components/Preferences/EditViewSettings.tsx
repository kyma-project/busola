import { Label, Option, Select } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import {
  editViewState,
  getEditViewState,
} from 'state/preferences/editViewAtom';

const AVAILABLE_EDIT_VIEW_OPTIONS = [
  { key: 'MODE_YAML', text: 'Always YAML' },
  { key: 'MODE_FORM', text: 'Always Form' },
  { key: 'MODE_DEFAULT', text: 'Default ( last one used )' },
];

export default function EditViewSettings() {
  const { t } = useTranslation();
  const [editView, setEditView] = useRecoilState(editViewState);

  const { preferencesViewType } = getEditViewState(editView);

  return (
    <>
      <Label
        for="editTypeComboBox"
        style={{
          ...spacing.sapUiTinyMarginBottom,
          ...spacing.sapUiSmallMarginBegin,
        }}
      >
        Choose default resource edit view
      </Label>
      <Select
        id="editTypeComboBox"
        onChange={e => {
          setEditView({
            preferencesViewType: e.target.value ?? 'MODE_DEFAULT',
            dynamicViewType:
              e.target.value === 'MODE_DEFAULT' ? 'MODE_FORM' : null,
          });
        }}
      >
        {AVAILABLE_EDIT_VIEW_OPTIONS.map(available_option => (
          <Option
            value={available_option.key}
            selected={preferencesViewType === available_option.key}
          >
            {available_option.text}
          </Option>
        ))}
      </Select>
    </>
  );
}
