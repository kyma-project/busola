import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { GenericList } from 'shared/components/GenericList/GenericList';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

export function GenericListRenderer({
  storeKeys,
  schema,
  schemaKeys,
  ...props
}) {
  const { store } = useUIStore();
  let { value } = store?.extractValues(storeKeys) || {};
  if (!value) return null;
  value = value.toJS();

  return (
    <>
      <GenericList
        title={<TransTitle schema={schema} storeKeys={storeKeys} />}
        entries={value}
        headerRenderer={() => Object.keys(value[0] || {})}
        rowRenderer={singleValue =>
          Object.keys(value[0] || {}).map(key =>
            JSON.stringify(singleValue[key]),
          )
        }
      />
    </>
  );
}
