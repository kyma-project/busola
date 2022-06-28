import React from 'react';

import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
}) {
  const { tFromStoreKeys } = useGetTranslation();
  const { t } = useTranslation();

  let titleTranslation = '';
  const path = storeKeys.toArray().join('.');

  if (tFromStoreKeys(storeKeys) !== path)
    titleTranslation = tFromStoreKeys(storeKeys);
  else if (path === 'metadata.labels')
    titleTranslation = t('common.headers.labels');
  else if (path === 'metadata.annotations')
    titleTranslation = t('common.headers.annotations');

  return (
    <KeyValueField
      value={value ? Object.fromEntries(value) : {}}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: createOrderedMap(value) },
        });
      }}
      title={titleTranslation}
    />
  );
}
