import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';

import { useNotification } from 'shared/contexts/NotificationContext';
import { base64Decode, base64Encode } from 'shared/helpers';
import { useTranslation } from 'react-i18next';

DecodeSecretSwitch.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  setEntries: PropTypes.func.isRequired,
  isEncoded: PropTypes.bool.isRequired,
  setEncoded: PropTypes.func.isRequired,
};
function applyOnEntries(fn, entries) {
  return entries.map(e => ({ ...e, value: fn(e.value) }));
}

export function DecodeSecretSwitch({
  entries,
  setEntries,
  isEncoded,
  setEncoded,
}) {
  const notification = useNotification();
  const { t } = useTranslation();

  const onClick = () => {
    try {
      setEntries(
        applyOnEntries(isEncoded ? base64Decode : base64Encode, entries),
      );
      setEncoded(!isEncoded);
    } catch (e) {
      notification.notifyError({
        content: t('secrets.create-modal.messages.decoding-failure', {
          error: e.message,
        }),
      });
    }
  };

  return (
    <Button
      design="Transparent"
      icon={isEncoded ? 'show' : 'hide'}
      onClick={onClick}
    >
      {isEncoded ? t('secrets.buttons.decode') : t('secrets.buttons.encode')}
    </Button>
  );
}
