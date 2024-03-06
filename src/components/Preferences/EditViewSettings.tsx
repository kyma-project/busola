import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import {
  EditView,
  editViewState,
  getEditViewState,
} from 'state/preferences/editViewAtom';

export default function EditViewSettings() {
  const { t } = useTranslation();
  const [editView, setEditView] = useRecoilState(editViewState);

  const { preferencesViewType, dynamicViewType } = getEditViewState(editView);

  console.log(editView);
  //console.log(editView.viewType);
  return (
    <>
      <ComboBox
        onSelectionChange={e => {
          console.log(e.target.value);
          setEditView({
            preferencesViewType: e.target.value ?? 'auto',
            dynamicViewType: e.target.value === 'auto' ? 'MODE_FORM' : null,
          });
        }}
        value={preferencesViewType}
      >
        <ComboBoxItem text="YAML" />
        <ComboBoxItem text="form" />
        <ComboBoxItem text="auto" />
      </ComboBox>
    </>
  );
}
