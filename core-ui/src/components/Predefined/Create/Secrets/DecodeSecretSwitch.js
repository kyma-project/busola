import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';
import { useNotification } from 'react-shared';

import { base64Decode, base64Encode } from 'shared/helpers';

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
  i18n,
}) {
  const notification = useNotification();
  const { t } = useTranslation(null, { i18n });

  const onClick = () => {
    try {
      setEntries(
        applyOnEntries(isEncoded ? base64Decode : base64Encode, entries),
      );
      setEncoded(!isEncoded);
    } catch (e) {
      notification.notifyError({
        content: t('secrets.create-modal.messages.decoding-failed', {
          error: e.message,
        }),
      });
    }
  };

  return (
    <Button
      option="transparent"
      glyph={isEncoded ? 'show' : 'hide'}
      onClick={onClick}
    >
      {isEncoded ? t('secrets.decode') : t('secrets.encode')}
    </Button>
  );
}
