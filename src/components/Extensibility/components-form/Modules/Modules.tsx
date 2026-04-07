import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@ui-schema/react/UIStore';
import { WidgetProps } from '@ui-schema/react';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { fromJS } from 'immutable';

import { CheckBox, MessageStrip } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { Resource } from 'components/Extensibility/contexts/DataSources';

import './Modules.scss';

type ModulesProps = {
  resource: Resource;
  onChange: (action: Record<string, any>) => void;
} & WidgetProps;

export function Modules({
  storeKeys,
  resource,
  onChange,
  schema,
  required,
}: ModulesProps) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const sectionName = schema.get('name');

  const setCheckbox = (
    key: string,
    entryValue: string,
    checked: boolean,
    index: number,
  ) => {
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
  const { value } =
    store?.extractValues(storeKeys) || ({} as Record<string, any>);
  const { itemVars } = useVariables();
  const stableJsonataDeps = useMemo(
    () => ({
      resource,
      scope: value,
      value,
    }),
    [resource, value],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const rule = schema.get('schemaRule');
  const options = schema.get('options');
  const [parsedOptions, setParsedOptions] = useState<Record<string, any>>({});

  useEffect(() => {
    async function makeJsonata(propObject?: string | any) {
      if (typeof propObject === 'string') {
        const [newEnum] = await jsonata(
          propObject,
          itemVars(resource, rule?.itemVars, storeKeys),
          [],
        );
        return newEnum;
      }
      console.warn('Widget::Modules');
      return null;
    }
    const parsedOpt = {} as Record<string, any>;
    Promise.all(
      Object.keys(options).map(async (optionName) => {
        if (
          optionName === 'name' &&
          !Array.isArray(await makeJsonata(options[optionName]))
        ) {
          const moduleName = await makeJsonata(options[optionName]);
          parsedOpt[optionName] = [moduleName];
        } else {
          parsedOpt[optionName] = await makeJsonata(options[optionName]);
        }
      }),
    ).then(() => setParsedOptions(parsedOpt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableJsonataDeps, rule?.itemVars, storeKeys, options]);

  const Items = parsedOptions?.name?.map((name: string, index: number) => {
    if (!name)
      return (
        <MessageStrip
          key={`no-modules-${index}`}
          design="Critical"
          hideCloseButton
        >
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      );

    const isChecked = !!(value ? value.toJS() : []).find(
      (v: { name: string }) => {
        return v.name === name;
      },
    );

    const channelModuleTemplate = [] as {
      text: string;
      additionalText: string;
    }[];

    parsedOptions?.moduleTemplates?.map(
      (moduleTemplate: Record<string, any>) => {
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
      },
    );

    const link = parsedOptions?.moduleTemplates?.find(
      (moduleTemplate: Record<string, any>) => {
        const channel = resource?.spec?.modules
          ? (resource?.spec?.modules[index]?.channel ?? resource?.spec?.channel)
          : resource?.spec?.channel;

        if (
          moduleTemplate?.metadata?.labels[
            'operator.kyma-project.io/module-name'
          ] === name &&
          moduleTemplate?.spec?.channel === channel
        )
          return moduleTemplate;
        else return null;
      },
    )?.metadata?.annotations['operator.kyma-project.io/doc-url'];

    const isBeta = parsedOptions?.moduleTemplates?.find(
      (moduleTemplate: Record<string, any>) =>
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name &&
        moduleTemplate?.metadata?.labels['operator.kyma-project.io/beta'] ===
          'true',
    );

    return (
      <>
        <div className="gridbox">
          <div className="sap-margin-top-small">
            {index === 0 ? `${sectionName}:` : ''}
          </div>
          <CheckBox
            accessibleName={`${name}`}
            className="sap-margin-top-small"
            checked={isChecked}
            onChange={(e) => {
              setCheckbox(
                'name',
                name,
                e.target.checked,
                resource?.spec?.modules
                  ? resource?.spec?.modules.findIndex(
                      (module: { name: string }) => {
                        return module.name === name;
                      },
                    )
                  : index,
              );
            }}
            text={name}
          />
          {/* @ts-expect-error Type mismatch between js and ts */}
          <Dropdown
            className="sap-margin-top-tiny"
            label={t('extensibility.widgets.modules.module-channel-label')}
            disabled={!isChecked}
            placeholder={t(
              'extensibility.widgets.modules.module-channel-placeholder',
            )}
            options={channelModuleTemplate.map((option) => {
              return {
                text: `${option.text} ${option.additionalText}`,
                key: option.text,
              };
            })}
            selectedKey={
              resource?.spec?.modules
                ? resource?.spec?.modules[
                    resource?.spec?.modules.findIndex(
                      (module: { name: string }) => {
                        return module.name === name;
                      },
                    )
                  ]?.channel
                : ''
            }
            onSelect={(_: any, selected: { key: string | number }) => {
              if (selected.key !== -1) {
                onChange({
                  storeKeys: storeKeys
                    .push(
                      resource?.spec?.modules
                        ? resource?.spec?.modules.findIndex(
                            (module: { name: string }) => {
                              return module.name === name;
                            },
                          )
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
            <ExternalLink url={link} iconClassName="sap-margin-top-medium">
              {t('extensibility.widgets.modules.documentation')}
            </ExternalLink>
          ) : null}
        </div>
        {parsedOptions?.betaAlert && isBeta && isChecked ? (
          <MessageStrip
            design="Critical"
            hideCloseButton
            className="alert sap-margin-y-small"
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
