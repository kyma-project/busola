import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import { fromJS } from 'immutable';
import { ComboboxInput, MessageStrip, Checkbox, Link } from 'fundamental-react';

import './Modules.scss';
import { Trans } from 'react-i18next';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';

export function Modules({
  storeKeys,
  resource,
  onChange,
  schema,
  required,
  editMode,
}) {
  const { t: tExt } = useGetTranslation();
  const sectionName = schema.get('name');

  const setCheckbox = (fullValue, key, entryValue, checked, index) => {
    if (checked) {
      onChange({
        storeKeys,
        scopes: ['value', 'internal'],
        type: 'list-item-add',
        schema,
        itemValue: fromJS({ [key]: entryValue }),
        required,
      });
    } else {
      onChange({
        storeKeys,
        scopes: ['value', 'internal'],
        type: 'list-item-delete',
        index,
        schema,
        required,
      });
    }
  };
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || [];
  const { itemVars } = useVariables();
  const jsonata = useJsonata({
    resource,
    scope: value,
    value,
  });

  const rule = schema.get('schemaRule');

  const options = schema.get('options');
  let parsedOptions = {};

  function makeJsonata(propObject) {
    if (typeof propObject === 'string') {
      const [newEnum] = jsonata(
        propObject,
        itemVars(resource, rule.itemVars, storeKeys),
        [],
      );
      return newEnum;
    }
    console.warn('Widget::Modules');
    return null;
  }

  Object.keys(options).forEach(optionName => {
    parsedOptions[optionName] = makeJsonata(options[optionName]);
  });

  const Items = parsedOptions?.name?.map((name, index) => {
    const isChecked = !!(value ? value.toJS() : []).find(v => {
      return v.name === name;
    });

    let channelTest = [];

    parsedOptions?.moduleTemplates?.map(moduleTemplate => {
      if (
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name
      ) {
        if (moduleTemplate?.spec?.descriptor?.component?.version)
          return channelTest.push({
            text: moduleTemplate.spec.channel,
            additionalText: `(version: ${moduleTemplate?.spec?.descriptor?.component?.version})`,
          });

        return channelTest.push({
          text: moduleTemplate.spec.channel,
          additionalText: '',
        });
      } else {
        return '';
      }
    });

    const link = parsedOptions?.moduleTemplates?.find(moduleTemplate => {
      const channel = resource?.spec?.modules
        ? resource?.spec?.modules[index]?.channel ?? resource?.spec?.channel
        : null;
      if (
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name &&
        moduleTemplate?.spec?.channel === channel
      )
        return moduleTemplate;
      else return null;
    })?.metadata?.annotations['operator.kyma-project.io/doc-url'];

    const isBeta = parsedOptions?.moduleTemplates?.find(
      moduleTemplate =>
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name &&
        moduleTemplate?.metadata?.labels['operator.kyma-project.io/beta'] ===
          'true',
    );

    return (
      <>
        <div className="flexbox">
          <Checkbox
            className="checkbox-test"
            key={name}
            value={name}
            checked={isChecked}
            onChange={e => {
              setCheckbox(
                value,
                'name',
                name,
                e.target.checked,
                resource?.spec?.modules
                  ? resource?.spec?.modules.findIndex(module => {
                      return module.name === name;
                    })
                  : index,
              );
            }}
          >
            {name}
          </Checkbox>
          <ComboboxInput
            disabled={!isChecked}
            options={channelTest.map(option => {
              return {
                text: `${option.text} ${option.additionalText}`,
                key: option.text,
              };
            })}
            selectedKey={
              resource?.spec?.modules
                ? resource?.spec?.modules[
                    resource?.spec?.modules.findIndex(module => {
                      return module.name === name;
                    })
                  ]?.channel
                : ''
            }
            onSelectionChange={(_, selected) => {
              if (selected.key !== -1) {
                const xd = selected.key;
                onChange({
                  storeKeys: storeKeys.push(index).push('channel'),
                  scopes: ['value'],
                  type: 'set',
                  schema,
                  data: { value: xd },
                  required,
                });
              }
            }}
          />
        </div>
        {!parsedOptions?.displayDocs && link && isChecked ? (
          <MessageStrip type="information" className="fd-margin-bottom--sm">
            <Trans i18nKey="extensibility.message.link-to-docs">
              <Link
                className="fd-link"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Trans>
          </MessageStrip>
        ) : null}
        {parsedOptions?.betaAlert && isBeta && isChecked ? (
          <MessageStrip type="warning" className="fd-margin-bottom--sm">
            {tExt(parsedOptions?.betaAlert)}
          </MessageStrip>
        ) : null}
      </>
    );
  });

  return (
    <ResourceForm.CollapsibleSection title={tExt(sectionName)} defaultOpen>
      {Items ? Items : <p></p>}
    </ResourceForm.CollapsibleSection>
  );
}
