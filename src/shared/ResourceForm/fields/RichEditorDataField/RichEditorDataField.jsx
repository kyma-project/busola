import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { RichEditorSection } from './RichEditorSection';

function createInternalState(data, previousInitialState) {
  const dataAsArray = transformData(data, previousInitialState);

  if (checkIfLastItemIsNotNull(dataAsArray)) {
    // Add new empty field
    return [...dataAsArray, null];
  } else {
    return dataAsArray;
  }
}

function transformData(obj, internalData) {
  return Object.entries(obj || {}).map(([key, value]) => {
    return {
      key,
      value,
      language: internalData?.find((d) => d?.key === key)?.language || '',
    };
  });
}

function checkIfLastItemIsNotNull(arr) {
  return !arr.length || arr[arr.length - 1];
}

export function RichEditorDataField({
  value: data,
  setValue: setData,
  tooltipContent,
}) {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState(() =>
    createInternalState(data, null),
  );

  const [prevData, setPrevData] = useState(data);
  // if previous data changed
  if (prevData !== data) {
    setPrevData(data);
    setInternalData(createInternalState(data, internalData));
  }

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
      tooltipContent={tooltipContent}
      title={t('common.labels.data')}
    >
      {internalData.map((item, index) => (
        <RichEditorSection
          key={index}
          item={item}
          onChange={(data) => {
            setInternalData((internalData) => {
              internalData[index] = {
                ...item,
                ...data,
              };
              return [...internalData];
            });
          }}
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
