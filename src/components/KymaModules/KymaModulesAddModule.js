import { CheckBox, MessageStrip } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

import { ResourceForm } from 'shared/ResourceForm';
import { Dropdown } from 'shared/ResourceForm/inputs';

import './KymaModulesAddModule.scss';

export default function KymaModulesAddModule(onChange) {
  const { t } = useTranslation();
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;
  const kymaResourceUrl =
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/default';

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
  });

  const { data: kymaResource } = useGet(kymaResourceUrl, {
    pollingInterval: 3000,
  });

  const modulesAddData = modules?.items.reduce((acc, module) => {
    const name = module.metadata.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find(item => item.name === name);

    if (!existingModule) {
      acc.push({
        name: name,
        channels: [
          {
            channel: module.spec.channel,
            version: module.spec.descriptor.component.version,
          },
        ],
        docsUrl:
          module.metadata.annotations['operator.kyma-project.io/doc-url'],
        isBeta:
          module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
      });
    } else {
      existingModule.channels.push({
        channel: module.spec.channel,
        version: module.spec.descriptor.component.version,
      });
    }

    return acc;
  }, []);

  const isChecked = name => {
    return kymaResource?.spec?.modules?.find(module => module.name === name)
      ? true
      : false;
  };

  return (
    <ResourceForm
      pluralKind={'kymas'}
      singularName={'Kyma'}
      resource={kymaResource}
      setResource={() => {}}
      initialResource={kymaResource}
      afterCreatedFn={() => {}}
      disableDefaultFields
      onChange={onChange}
    >
      {modulesAddData?.map(module => {
        return (
          <>
            <div className="gridbox">
              <div></div>
              <CheckBox
                style={spacing.sapUiSmallMarginTop}
                checked={isChecked(module.name)}
                // onChange={e => {
                //   setCheckbox(
                //     value,
                //     'name',
                //     name,
                //     e.target.checked,
                //     resource?.spec?.modules
                //       ? resource?.spec?.modules.findIndex(module => {
                //           return module.name === name;
                //         })
                //       : index,
                //   );
                // }}
                text={module.name}
              />
              <Dropdown
                style={spacing.sapUiTinyMarginTop}
                label={t('extensibility.widgets.modules.module-channel-label')}
                disabled={!isChecked(module.name)}
                placeholder={t(
                  'extensibility.widgets.modules.module-channel-placeholder',
                )}
                options={module.channels.map(option => {
                  return {
                    text: `${option.channel} (version: ${option.version})`,
                    key: option.channel,
                  };
                })}
                // selectedKey={
                //   resource?.spec?.modules
                //     ? resource?.spec?.modules[
                //         resource?.spec?.modules.findIndex(module => {
                //           return module.name === name;
                //         })
                //       ]?.channel
                //     : ''
                // }
                // onSelect={(_, selected) => {
                //   if (selected.key !== -1) {
                //     onChange({
                //       storeKeys: storeKeys
                //         .push(
                //           resource?.spec?.modules
                //             ? resource?.spec?.modules.findIndex(module => {
                //                 return module.name === name;
                //               })
                //             : index,
                //         )
                //         .push('channel'),
                //       scopes: ['value'],
                //       type: 'set',
                //       schema,
                //       data: { value: selected.key },
                //       required,
                //     });
                //   }
                // }}
              />

              {module.docsUrl ? (
                <ExternalLink
                  url={module.docsUrl}
                  iconStyle={spacing.sapUiMediumMarginTop}
                >
                  {t('extensibility.widgets.modules.documentation')}
                </ExternalLink>
              ) : null}
            </div>
            {module?.isBeta ? (
              <MessageStrip
                design="Warning"
                hideCloseButton
                className="alert"
                style={spacing.sapUiSmallMarginTopBottom}
              >
                {'t(parsedOptions?.betaAlert)'}
              </MessageStrip>
            ) : null}
          </>
        );
      })}
    </ResourceForm>
  );
}
