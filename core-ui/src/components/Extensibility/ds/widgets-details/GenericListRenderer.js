import React from 'react';
import { TransTitle, PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button, LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { prettifyNamePlural } from 'shared/utils/helpers';

export function GenericListRenderer({
  storeKeys,
  onChange,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level,
  ...props
}) {
  const { t } = useTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;

  return (
    <p>
      {value}
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={prettifyNamePlural(props.ownKey)} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {value.map(value => {
            return <LayoutPanelRow value={value + '\n'} />;
          })}
        </LayoutPanel.Body>
      </LayoutPanel>
      {/* <GenericList
        title={'Title'}
        // showSearchField={showSearchField}
        // textSearchProperties={textSearchProperties}
        // showSearchSuggestion={false}
        entries={value.map(value => {
          console.log('Entry', value);
          return value;
        })}
        // headerRenderer={headerRenderer}
        // rowRenderer={rowRenderer}
        // noSearchResultMessage={
        // ACCESS_STRATEGIES_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
        // }
        // i18n={i18n}
      /> */}
      {/* {Array(listSize).map((_val, index) => {
        console.log('val', _val);
        console.log('index', index);
        // const ownKeys = storeKeys.push(index);
        const itemsSchema = schema.get('items');
        return (
          <p>{itemsSchema}</p>
          // <PluginStack
          //   // showValidity={showValidity}
          //   schema={itemsSchema}
          //   parentSchema={schema}
          //   storeKeys={ownKeys}
          //   level={level + 1}
          //   // schemaKeys={schemaKeys?.push('items')}
          // />
        );
      })} */}
    </p>
  );
}
