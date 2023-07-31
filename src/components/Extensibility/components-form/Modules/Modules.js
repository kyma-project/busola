import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import { fromJS } from 'immutable';
import {
  ComboboxInput,
  MessageStrip,
  Checkbox,
  Link,
  Icon,
} from 'fundamental-react';

import './Modules.scss';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';

export function Modules({
  storeKeys,
  resource,
  onChange,
  schema,
  required,
  editMode,
}) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const sectionName = schema.get('name');

  const setCheckbox = (fullValue, key, entryValue, checked, index) => {
    console.log(storeKeys.toJS());
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
        : resource?.spec?.channel;

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
        <div className="flexbox fd-margin-bottom--sm">
          <div className="fd-align-vertical-center-ignor-checkbox-label">
            {index === 0 ? `${sectionName}:` : ''}
          </div>
          <Checkbox
            className="fd-align-vertical-center-ignor-checkbox-label"
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
            label={t('extensibility.widgets.modules.module-channel-label')}
            compact
            disabled={!isChecked}
            placeholder={t(
              'extensibility.widgets.modules.module-channel-placeholder',
            )}
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
                console.log(
                  storeKeys
                    .push(index)
                    .push('channel')
                    .toJS(),
                  storeKeys.toJS(),
                );
                onChange({
                  storeKeys: storeKeys.push(index).push('channel'),
                  scopes: ['value'],
                  type: 'set',
                  schema,
                  data: { value: selected.key },
                  required,
                });
              }
            }}
          />

          {link ? (
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-align-vertical-center-ignor-checkbox-label"
            >
              {t('extensibility.widgets.modules.documentation')}
              <Icon glyph="action" size="s" className="fd-margin-begin--tiny" />
            </Link>
          ) : null}
        </div>
        {parsedOptions?.betaAlert && isBeta && isChecked ? (
          <MessageStrip
            type="warning"
            className="fd-margin-bottom--sm fd-margin-top--sm alert"
          >
            {tExt(parsedOptions?.betaAlert)}
          </MessageStrip>
        ) : null}
      </>
    );
  });

  return (
    <ResourceForm.CollapsibleSection defaultOpen title={sectionName || ''}>
      <div>{Items}</div>
    </ResourceForm.CollapsibleSection>
  );
}
