import React from 'react';
import { Button } from 'fundamental-react';
import { useNotification } from 'react-shared';

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

  const onClick = () => {
    try {
      setEntries(applyOnEntries(isEncoded ? atob : btoa, entries));
      setEncoded(!isEncoded);
    } catch (e) {
      notification.notifyError({
        title: 'Cannot decode secret data',
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
