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
  ...props
}) {
  const { t } = useTranslation();

  values = values || [];

  const remove = index => setValues(values.filter((_, i) => index !== i));

  const renderItem = (item, index) =>
    itemRenderer({ item, values, setValues, index, isAdvanced });

  const renderAllItems = () =>
    values.map((current, i) => {
      const name = typeof entryTitle === 'function' && entryTitle(current, i);
      return (
        <ResourceForm.CollapsibleSection
          key={i}
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
