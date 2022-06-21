import { Button } from 'fundamental-react';
import { isNil } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { FormField } from '../../components/FormField';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';

import flourite from 'flourite';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { languages } from 'monaco-editor';

function detectLanguage(text) {
  const { statistics } = flourite(text || '');
  delete statistics['Julia']; // Julia language messes up with JS
  return Object.entries(statistics || {})
    .reduce(
      (max, [key, value]) => {
        if (value > max.value) {
          return { key, value };
        }
        return max;
      },
      { key: '', value: 0 },
    )
    .key.toLowerCase();
}

export function RichEditorDataField({ value: data, setValue: setData }) {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState([]);
  const valueRef = useRef(null);

  if (JSON.stringify(data) !== valueRef.current) {
    setInternalData(
      Object.entries(data || {}).map(([key, value]) => ({
        key,
        value,
        language: '',
      })),
    );
    valueRef.current = JSON.stringify(data);
  }

  const pushValue = internalValue => {
    setData(
      Object.fromEntries(
        internalValue.filter(Boolean).map(({ key, value }) => [key, value]),
      ),
    );
  };

  useEffect(() => {
    if (!internalData.length || internalData[internalData.length - 1]) {
      setInternalData([...internalData, null]);
    }
  }, [internalData]);

  return (
    <ResourceForm.CollapsibleSection
      defaultOpen
      title={t('common.labels.data')}
    >
      {internalData.map((item, index) => {
        const { key, value, language } = item || {};
        return (
          <ResourceForm.CollapsibleSection
            title={key}
            language={language || ''}
            actions={
              <>
                <Dropdown
                  disabled={!item}
                  compact
                  options={languages
                    .getLanguages()
                    .map(l => ({ key: l.id, text: l.aliases?.[0] || l.id }))}
                  selectedKey={language || ''}
                  onSelect={(e, { key: language }) => {
                    e.stopPropagation(); // don't collapse the section
                    setInternalData(internalValue => {
                      internalValue[index] = { key, value, language };
                      return [...internalValue];
                    });
                  }}
                />
                <Button
                  glyph="delete"
                  disabled={!item}
                  compact
                  type="negative"
                  onClick={() => {
                    internalData.splice(index, 1);
                    setInternalData([...internalData]);
                    pushValue(internalData);
                  }}
                />
              </>
            }
            key={index}
            defaultOpen
          >
            <FormField
              value={key || ''}
              setValue={key => {
                internalData[index] = {
                  key,
                  value: value || '',
                  language: item?.language || '',
                };
                setInternalData([...internalData]);
              }}
              input={Inputs.Text}
              label={t('components.key-value-form.key')}
              className="fd-margin-bottom--sm"
              onBlur={() => pushValue(internalData)}
            />
            <Editor
              language={language || ''}
              height="120px"
              autocompletionDisabled
              value={isNil(value) ? '' : value.toString()}
              onChange={value => {
                setInternalData(internalValue => {
                  internalValue[index] = {
                    key: internalValue[index]?.key || '',
                    value,
                    language: internalValue[index]?.language || '',
                  };
                  return [...internalValue];
                });
              }}
              onBlur={() => pushValue(internalData)}
            />
          </ResourceForm.CollapsibleSection>
        );
      })}
    </ResourceForm.CollapsibleSection>
  );
}
