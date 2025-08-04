import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Label, Switch } from '@ui5/webcomponents-react';
import { dontConfirmDeleteState } from 'state/preferences/dontConfirmDeleteAtom';

export default function ConfirmationSettings() {
  const { t } = useTranslation();
  const [dontConfirmDelete, setDontConfirmDelete] = useRecoilState(
    dontConfirmDeleteState,
  );

  return (
    <div className="preferences-row">
      <Label
        for="dont-confirm-delete-switch"
        className="bsl-has-color-status-4"
      >
        {t('settings.clusters.dontConfirmDelete')}
      </Label>
      <div>
        <Switch
          id="dont-confirm-delete-switch"
          accessibleName={t('settings.clusters.dontConfirmDelete')}
          checked={dontConfirmDelete}
          onChange={() => setDontConfirmDelete(previousState => !previousState)}
        />
      </div>
    </div>
  );
}
