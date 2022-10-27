import React from 'react';
import { Button, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from '..';

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
  simple,
  advanced,
  isAdvanced,
  readOnly,
  nestingLevel = 0,
  ...props
}) {
  const { t } = useTranslation();

  if (!Array.isArray(values)) {
    console.warn(
      'ItemArray: expected "values" to be array, instead got',
      values,
    );
    values = [];
  }

  const remove = index => setValues(values.filter((_, i) => index !== i));

  const renderItem = (item, index) =>
    itemRenderer({
      item,
      values,
      setValues,
      index,
      isAdvanced,
      nestingLevel: nestingLevel + 1,
    });

  const renderAllItems = () =>
    values.map((current, i) => {
      const name = typeof entryTitle === 'function' && entryTitle(current, i);
      return (
        <ResourceForm.CollapsibleSection
          key={i}
          nestingLevel={nestingLevel + 1}
          title={
            <>
              {nameSingular} {name || i + 1}
            </>
          }
          actions={
            <Button
              compact
              glyph="delete"
              type="negative"
              onClick={() => remove(i)}
              disabled={readOnly}
              option="transparent"
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
      actions={setOpen => (
        <Button
          glyph="add"
          compact
          onClick={() => {
            setValues([...values, newResourceTemplateFn()]);
            setOpen(true);
          }}
          disabled={readOnly}
          option="transparent"
          iconBeforeText
        >
          {t('common.buttons.add')} {nameSingular}
        </Button>
      )}
      isAdvanced={isAdvanced}
      {...props}
    >
      {content}
      {atLeastOneRequiredMessage && !values.length && (
        <MessageStrip type="warning">{atLeastOneRequiredMessage}</MessageStrip>
      )}
    </ResourceForm.CollapsibleSection>
  );
}
