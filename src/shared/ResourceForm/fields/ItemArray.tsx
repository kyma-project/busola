import { Dispatch, SetStateAction } from 'react';
import { Button, MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from '..';

type ItemArrayProps = {
  value: any[];
  setValue: (val: any[]) => void;
  listTitle: string | JSX.Element;
  entryTitle: string | ((item: any, index: number) => string | JSX.Element);
  nameSingular: string;
  atLeastOneRequiredMessage?: string | JSX.Element;
  allowEmpty?: boolean;
  itemRenderer: (props: {
    item: any;
    values: any[];
    setValues: (vals: any[]) => void;
    index: number;
    nestingLevel: number;
  }) => JSX.Element;
  newResourceTemplateFn: () => any;
  readOnly?: boolean;
  tooltipContent?: string | JSX.Element;
  nestingLevel?: number;
  disabled?: boolean;
  defaultOpen?: boolean;
  canChangeState?: boolean;
  defaultTitleType?: boolean;
  resource?: Record<string, any> | string;
  setResource?: (resource: Record<string, any> | string) => void;
  className?: string;
  required?: boolean;
};

export function ItemArray({
  value: values,
  setValue: setValues,
  listTitle,
  entryTitle,
  nameSingular,
  atLeastOneRequiredMessage,
  allowEmpty = false,
  itemRenderer,
  newResourceTemplateFn,
  readOnly,
  tooltipContent,
  nestingLevel = 0,
  disabled,
  defaultOpen,
  canChangeState,
  defaultTitleType,
  resource,
  setResource,
  className,
  required,
}: ItemArrayProps) {
  const { t } = useTranslation();

  if (!Array.isArray(values)) {
    console.warn(
      'ItemArray: expected "values" to be array, instead got',
      values,
    );
    values = [];
  }

  const remove = (index: number) =>
    setValues(values.filter((_, i) => index !== i));

  const renderItem = (item: any, index: number) =>
    itemRenderer({
      item,
      values,
      setValues,
      index,
      nestingLevel: nestingLevel + 1,
    });

  const renderAllItems = () =>
    values.map((current, i) => {
      const name = typeof entryTitle === 'function' && entryTitle(current, i);
      return (
        <ResourceForm.CollapsibleSection
          key={`${nameSingular}-${i}`}
          nestingLevel={nestingLevel + 1}
          title={
            <>
              {nameSingular} {name || i + 1}
            </>
          }
          actions={
            <Button
              icon="delete"
              design="Transparent"
              onClick={() => remove(i)}
              disabled={readOnly}
            />
          }
        >
          {renderItem(current, i)}
        </ResourceForm.CollapsibleSection>
      );
    });

  const content =
    values.length === 1 && !allowEmpty
      ? renderItem(values[0], 0)
      : renderAllItems();

  return (
    <ResourceForm.CollapsibleSection
      title={listTitle}
      tooltipContent={tooltipContent}
      actions={(setOpen: Dispatch<SetStateAction<boolean | undefined>>) => (
        <Button
          icon="add"
          onClick={() => {
            setValues([...values, newResourceTemplateFn()]);
            setOpen(true);
          }}
          disabled={readOnly}
          design="Transparent"
        >
          {t('common.buttons.add')} {nameSingular}
        </Button>
      )}
      disabled={disabled}
      defaultOpen={defaultOpen}
      canChangeState={canChangeState}
      defaultTitleType={defaultTitleType}
      resource={resource}
      setResource={setResource}
      className={className}
      required={required}
    >
      {content}
      {atLeastOneRequiredMessage && !values.length && (
        <MessageStrip design="Critical" hideCloseButton>
          {atLeastOneRequiredMessage}
        </MessageStrip>
      )}
    </ResourceForm.CollapsibleSection>
  );
}
