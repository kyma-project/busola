import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'fundamental-react';
import { useNotification } from 'react-shared';
import { base64Decode, base64Encode } from 'shared/helpers';

DecodeSecretSwitch.propTypes = {
  secret: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  setSecret: PropTypes.func.isRequired,
  isEncoded: PropTypes.bool.isRequired,
  setEncoded: PropTypes.func.isRequired,
};

export function DecodeSecretSwitch({
  secret,
  setSecret,
  isEncoded,
  setEncoded,
}) {
  const notification = useNotification();

  const onClick = () => {
    try {
      let entries = secret.data;
      for (const key in secret.data) {
        entries[key] = isEncoded
          ? base64Decode(entries[key])
          : base64Encode(entries[key]);
      }
      setSecret({ ...secret, data: entries });
      setEncoded(!isEncoded);
    } catch (e) {
      notification.notifyError({
        title: 'Failed to decode the Secret data',
        content:
          "Some of the secret data couldn't be decoded. Correct them and try again: " +
          e.message,
      });
    }
  };

  return (
    <Button
      option="transparent"
      glyph={isEncoded ? 'show' : 'hide'}
      onClick={onClick}
    >
      {isEncoded ? 'Decode' : 'Encode'}
    </Button>
  );
}
