import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Switch } from '@ui5/webcomponents-react';
import { FormField } from 'shared/ResourceForm/components/FormField';
import { dontConfirmDeleteAtom } from 'state/settings/dontConfirmDeleteAtom';

export default function ConfirmationSettings() {
  const { t } = useTranslation();
  const [dontConfirmDelete, setDontConfirmDelete] = useAtom(
    dontConfirmDeleteAtom,
  );

  return (
    <FormField
      label={t('settings.general.dontConfirmDelete')}
      input={(props) => (
        <Switch
          {...props}
          checked={dontConfirmDelete}
          onChange={() =>
            setDontConfirmDelete((previousState) => !previousState)
          }
        />
      )}
    />
  );
}
