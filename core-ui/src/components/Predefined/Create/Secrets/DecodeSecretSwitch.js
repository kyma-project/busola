import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'fundamental-react';
import { useNotification } from 'react-shared';
import { base64Decode, base64Encode } from 'shared/helpers';
import { useTranslation } from 'react-i18next';

function applyOnEntries(fn, entries) {
  return entries.map(e => ({ ...e, value: fn(e.value) }));
}

DecodeSecretSwitch.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  setEntries: PropTypes.func.isRequired,
  isEncoded: PropTypes.bool.isRequired,
  setEncoded: PropTypes.func.isRequired,
};

export function DecodeSecretSwitch({
  entries,
  setEntries,
  isEncoded,
  setEncoded,
}) {
  const { t } = useTranslation();

  const notification = useNotification();

  const onClick = () => {
    try {
      setEntries(
        applyOnEntries(isEncoded ? base64Decode : base64Encode, entries),
      );
      setEncoded(!isEncoded);
    } catch (e) {
      notification.notifyError({
        title: t('secrets.errors.failed-to-decode'),
        content: t('secrets.errors.failed-to-decode-long') + e.message,
      });
    }
  };

  return (
    <Button
      option="transparent"
      glyph={isEncoded ? 'show' : 'hide'}
      onClick={onClick}
    >
      {isEncoded ? t('secrets.buttons.decode') : t('secrets.buttons.encode')}
    </Button>
  );
}
