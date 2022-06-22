import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { detectLanguage } from './languages';
import { RichEditorSection } from './RichEditorSection';

export function RichEditorDataField({ value: data, setValue: setData }) {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState([]);
  const valueRef = useRef(null);
  const firstRender = useRef(true); // detect languages only on first render

  // update internal value
  if (JSON.stringify(data) !== valueRef.current) {
    setInternalData(
      Object.entries(data || {}).map(([key, value]) => ({
        key,
        value,
        language:
          (firstRender
            ? detectLanguage(value)
            : internalData.find(d => d?.key === key)?.language) || '',
      })),
    );
    valueRef.current = JSON.stringify(data);
  }

  // add empty "new" item
  useEffect(() => {
    if (!internalData.length || internalData[internalData.length - 1]) {
      setInternalData([...internalData, null]);
    }
  }, [internalData]);

  // update original data source
  const pushValue = useCallback(() => {
    setData(
      Object.fromEntries(
        internalData.filter(Boolean).map(({ key, value }) => [key, value]),
      ),
    );
  }, [setData, internalData]);

  return (
    <ResourceForm.CollapsibleSection
      defaultOpen
      title={t('common.labels.data')}
    >
      {internalData.map((item, index) => (
        <RichEditorSection
          item={item}
          setInternalData={setInternalData}
          onChange={data =>
            setInternalData(internalData => {
              internalData[index] = {
                ...item,
                ...data,
              };
              return [...internalData];
            })
          }
          onDelete={() => {
            internalData.splice(index, 1);
            setInternalData([...internalData]);
            pushValue();
          }}
          pushValue={pushValue}
        />
      ))}
    </ResourceForm.CollapsibleSection>
  );
}
