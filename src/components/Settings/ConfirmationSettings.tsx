import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Label, Switch } from '@ui5/webcomponents-react';
import { dontConfirmDeleteAtom } from 'state/settings/dontConfirmDeleteAtom';

export default function ConfirmationSettings() {
  const { t } = useTranslation();
  const [dontConfirmDelete, setDontConfirmDelete] = useAtom(
    dontConfirmDeleteAtom,
  );

  return (
    <div className="settings-row">
      <Label
        for="dont-confirm-delete-switch"
        className="bsl-has-color-status-4"
      >
        {t('settings.general.dontConfirmDelete')}
      </Label>
      <div>
        <Switch
          id="dont-confirm-delete-switch"
          accessibleName={t('settings.general.dontConfirmDelete')}
          checked={dontConfirmDelete}
          onChange={() =>
            setDontConfirmDelete((previousState) => !previousState)
          }
        />
      </div>
    </div>
  );
}
