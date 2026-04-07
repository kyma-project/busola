import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { RichEditorSection } from './RichEditorSection';

type InternalItem = {
  key: string;
  value: string;
  language: string;
} | null;

type RichEditorDataFieldProps = {
  value?: Record<string, string>;
  setValue?: (data: Record<string, string>) => void;
  tooltipContent?: string;
  propertyPath?: string;
};

function createInternalState(
  data: Record<string, string>,
  previousInitialState: InternalItem[] | null,
): InternalItem[] {
  const dataAsArray = transformData(data, previousInitialState);

  if (checkIfLastItemIsNotNull(dataAsArray)) {
    // Add new empty field
    return [...dataAsArray, null];
  } else {
    return dataAsArray;
  }
}

function transformData(
  obj: Record<string, string>,
  internalData: InternalItem[] | null,
): InternalItem[] {
  return Object.entries(obj || {}).map(([key, value]) => {
    return {
      key,
      value,
      language: internalData?.find((d) => d?.key === key)?.language || '',
    };
  });
}

function checkIfLastItemIsNotNull(arr: InternalItem[]): boolean {
  return !arr.length || !!arr[arr.length - 1];
}

export function RichEditorDataField({
  value: data = {},
  setValue: setData,
  tooltipContent,
  propertyPath: _propertyPath,
}: RichEditorDataFieldProps) {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState<InternalItem[]>(() =>
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
    setData?.(
      Object.fromEntries(
        internalData
          .filter((item): item is NonNullable<InternalItem> => Boolean(item))
          .map(({ key, value }) => [key, value]),
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
              } as InternalItem;
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
