import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { prettifyNamePlural } from 'shared/utils/helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';

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
        title={prettifyNamePlural(props.ownKey)}
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
