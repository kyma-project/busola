import { Button } from 'fundamental-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';

export function RichEditorDataField({ value, setValue }) {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState([]);
  const valueRef = useRef(null);
  const [nV, setNV] = useState({ key: '', value: '' });

  if (JSON.stringify(value) !== valueRef.current) {
    setInternalValue(
      Object.entries(value || {}).map(([key, value]) => ({ key, value })),
    );
    valueRef.current = JSON.stringify(value);
  }

  const pushValue = internalValue => {
    setValue(
      Object.fromEntries(internalValue.map(({ key, value }) => [key, value])),
    );
  };

  return (
    <ResourceForm.CollapsibleSection title={t('common.labels.data')}>
      {internalValue.map(({ key, value }, index) => {
        return (
          <ResourceForm.CollapsibleSection
            title={key}
            actions={
              <Button
                glyph="delete"
                compact
                type="negative"
                onClick={() => {
                  internalValue.splice(index, 1);
                  setInternalValue([...internalValue]);
                  pushValue(internalValue);
                }}
              />
            }
            defaultOpen
          >
            <input
              value={key}
              onChange={e => {
                internalValue[index] = { key: e.target.value, value };
                setInternalValue([...internalValue]);
              }}
              onBlur={() => pushValue(internalValue)}
            />
            <Editor
              height="120px"
              autocompletionDisabled
              value={value}
              onChange={value => {
                internalValue[index] = { key, value };
                setInternalValue([...internalValue]);
              }}
              onBlur={() => pushValue(internalValue)}
            />
          </ResourceForm.CollapsibleSection>
        );
      })}
      <ResourceForm.CollapsibleSection title={'NEW VALUE'} defaultOpen>
        <input
          value={nV.key}
          onChange={e => setNV({ key: e.target.value, value: nV.value })}
          onBlur={() => {
            if (nV.key || nV.value) {
              pushValue([...internalValue, nV]);
              setNV({ key: '', value: '' });
            }
          }}
        />
        <Editor
          height="120px"
          autocompletionDisabled
          value={nV.value}
          onChange={value => setNV({ key: nV.key, value })}
          onBlur={() => {
            if (nV.key || nV.value) {
              pushValue([...internalValue, nV]);
              setNV({ key: '', value: '' });
            }
          }}
        />
      </ResourceForm.CollapsibleSection>
    </ResourceForm.CollapsibleSection>
  );
}
