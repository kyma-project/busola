import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';
import { LayoutPanel } from 'fundamental-react';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { prettifyNamePlural } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';
import { GenericList } from 'shared/components/GenericList/GenericList';

export function GenericListRenderer({
  storeKeys,
  schema,
  schemaKeys,
  ...props
}) {
  const { store } = useUIStore();
  let { value } = store?.extractValues(storeKeys) || {};
  value = value.toJS();
  console.log(value);

  return (
    <>
      <GenericList
        title={prettifyNamePlural(props.ownKey)}
        entries={value}
        headerRenderer={() => Object.keys(value[0] || {})}
        rowRenderer={pojedynczeValiu =>
          Object.keys(value[0] || {}).map(key =>
            JSON.stringify(pojedynczeValiu[key]),
          )
        }
      />
    </>
  );
}
