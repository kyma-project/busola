import React, { useRef, useState } from 'react';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';

export function RichEditorDataField({ value, setValue }) {
  const [internalValue, setInternalValue] = useState([]);
  const valueRef = useRef(null);

  if (JSON.stringify(value) !== valueRef.current) {
    setInternalValue(
      Object.entries(value || {}).map(([key, value]) => ({ key, value })),
    );
    valueRef.current = JSON.stringify(value);
  }

  return internalValue.map(({ key, value }, index) => {
    return (
      <div>
        <input
          value={key}
          onChange={e => {
            internalValue[index] = { key: e.target.value, value };
            setInternalValue([...internalValue]);
          }}
          onBlur={() =>
            setValue(
              Object.fromEntries(
                internalValue.map(({ key, value }) => [key, value]),
              ),
            )
          }
        />
        <Editor
          height="120px"
          autocompletionDisabled
          value={value}
          onChange={value => {
            internalValue[index] = { key, value };
            setInternalValue([...internalValue]);
          }}
          onBlur={() => {
            setValue(
              Object.fromEntries(
                internalValue.map(({ key, value }) => [key, value]),
              ),
            );
          }}
        />
      </div>
    );
  });
}
