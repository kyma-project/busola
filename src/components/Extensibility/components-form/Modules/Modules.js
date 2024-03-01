import { useUIStore } from '@ui-schema/ui-schema';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { fromJS } from 'immutable';

import { CheckBox, Icon, MessageStrip } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { Dropdown } from 'shared/ResourceForm/inputs';

import './Modules.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export function Modules({ storeKeys, resource, onChange, schema, required }) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
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
    if (
      optionName === 'name' &&
      !Array.isArray(makeJsonata(options[optionName]))
    ) {
      let moduleName = makeJsonata(options[optionName]);
      parsedOptions[optionName] = [moduleName];
    } else {
      parsedOptions[optionName] = makeJsonata(options[optionName]);
    }
  });

  const Items = parsedOptions?.name?.map((name, index) => {
    if (!name)
      return (
        <MessageStrip design="Warning" hideCloseButton>
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      );

    const isChecked = !!(value ? value.toJS() : []).find(v => {
      return v.name === name;
    });

    let channelModuleTemplate = [];

    parsedOptions?.moduleTemplates?.map(moduleTemplate => {
      if (
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name
      ) {
        if (moduleTemplate?.spec?.descriptor?.component?.version)
          return channelModuleTemplate.push({
            text: moduleTemplate.spec.channel,
            additionalText: `(version: ${moduleTemplate?.spec?.descriptor?.component?.version})`,
          });

        return channelModuleTemplate.push({
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
        <div className="gridbox ">
          <div style={spacing.sapUiSmallMarginTop}>
            {index === 0 ? `${sectionName}:` : ''}
          </div>
          <CheckBox
            style={spacing.sapUiSmallMarginTop}
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
            text={name}
          />
          <Dropdown
            style={spacing.sapUiTinyMarginTop}
            label={t('extensibility.widgets.modules.module-channel-label')}
            disabled={!isChecked}
            placeholder={t(
              'extensibility.widgets.modules.module-channel-placeholder',
            )}
            options={channelModuleTemplate.map(option => {
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
            onSelect={(_, selected) => {
              if (selected.key !== -1) {
                onChange({
                  storeKeys: storeKeys
                    .push(
                      resource?.spec?.modules
                        ? resource?.spec?.modules.findIndex(module => {
                            return module.name === name;
                          })
                        : index,
                    )
                    .push('channel'),
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
            <ExternalLink url={link} style={spacing.sapUiMediumMarginTop}>
              {t('extensibility.widgets.modules.documentation')}
              <Icon
                name="inspect"
                design="Information"
                className="ui5-icon-s"
                style={spacing.sapUiTinyMarginBegin}
              />
            </ExternalLink>
          ) : null}
        </div>
        {parsedOptions?.betaAlert && isBeta && isChecked ? (
          <MessageStrip
            design="Warning"
            hideCloseButton
            className="alert"
            style={spacing.sapUiSmallMarginTopBottom}
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
