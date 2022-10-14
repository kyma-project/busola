import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Switch } from 'fundamental-react';
import { dontConfirmDeleteState } from 'state/dontConfirmDeleteAtom';

export default function ConfirmationSettings() {
  const { t } = useTranslation();
  const [dontConfirmDelete, setDontConfirmDelete] = useRecoilState(
    dontConfirmDeleteState,
  );

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.dontConfirmDelete')}
      </span>
      <div>
        <Switch
          inputProps={{
            'aria-label': t('settings.clusters.dontConfirmDelete'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={dontConfirmDelete}
          onChange={() => setDontConfirmDelete(previousState => !previousState)}
          compact
        />
      </div>
    </div>
  );
}
