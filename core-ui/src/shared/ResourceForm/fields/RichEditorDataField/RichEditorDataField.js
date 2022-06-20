import { Button } from 'fundamental-react';
import { isNil } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';

export function RichEditorDataField({ value, setValue }) {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState([]);
  const valueRef = useRef(null);

  if (JSON.stringify(value) !== valueRef.current) {
    setInternalValue(
      Object.entries(value || {}).map(([key, value]) => ({ key, value })),
    );
    valueRef.current = JSON.stringify(value);
  }

  const pushValue = internalValue => {
    setValue(
      Object.fromEntries(
        internalValue.filter(Boolean).map(({ key, value }) => [key, value]),
      ),
    );
  };

  useEffect(() => {
    if (!internalValue.length || internalValue[internalValue.length - 1]) {
      setInternalValue([...internalValue, null]);
    }
  }, [internalValue]);

  return (
    <ResourceForm.CollapsibleSection title={t('common.labels.data')}>
      {internalValue.map((item, index) => {
        const { key, value } = item || {};
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
            key={index}
            defaultOpen
          >
            <input
              value={key || ''}
              onChange={e => {
                internalValue[index] = {
                  key: e.target.value,
                  value: value || '',
                };
                setInternalValue([...internalValue]);
              }}
              onBlur={() => pushValue(internalValue)}
            />
            <Editor
              height="120px"
              autocompletionDisabled
              value={isNil(value) ? '' : value.toString()}
              onChange={value => {
                setInternalValue(internalValue => {
                  internalValue[index] = {
                    key: internalValue[index]?.key || '',
                    value,
                  };
                  return [...internalValue];
                });
              }}
              onBlur={() => pushValue(internalValue)}
            />
          </ResourceForm.CollapsibleSection>
        );
      })}
    </ResourceForm.CollapsibleSection>
  );
}
