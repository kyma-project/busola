import { Button } from 'fundamental-react';
import { isNil } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { FormField } from '../../components/FormField';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { getAvailableLanguages } from './languages';

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
                  options={getAvailableLanguages().map(l => ({
                    key: l.id,
                    text: l.aliases?.[0] || l.id,
                  }))}
                  selectedKey={language || ''}
                  onSelect={(e, { key: language }) => {
                    e.stopPropagation(); // don't collapse the section
                    setInternalData(internalData => {
                      internalData[index] = {
                        ...internalData[index],
                        language,
                      };
                      return [...internalData];
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
                setInternalData(internalData => {
                  internalData[index] = {
                    key: internalData[index]?.key || '',
                    value,
                    language: internalData[index]?.language || '',
                  };
                  return [...internalData];
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
