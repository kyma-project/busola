import React from 'react';
import { Button } from 'fundamental-react';

function applyOnEntries(fn, entries) {
  return entries.map(e => ({ ...e, value: fn(e.value) }));
}

export function DecodeSecretSwitch({
  entries,
  setEntries,
  isEncoded,
  setEncoded,
}) {
  const onClick = () => {
    try {
      setEntries(applyOnEntries(isEncoded ? atob : btoa, entries));
      setEncoded(!isEncoded);
    } catch (e) {
      alert(e);
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
