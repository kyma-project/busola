import { useState, useEffect } from 'react';
import { CheckBox, MessageStrip } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { Dropdown } from 'shared/ResourceForm/inputs';

import './KymaModulesAddModule.scss';

export default function KymaModulesAddModule(props) {
  const { t } = useTranslation();
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;
  const kymaResourceUrl =
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/default';

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
  });

  const { data: initialKymaResource, loading } = useGet(kymaResourceUrl, {
    pollingInterval: 3000,
  });

  const [kymaResource, setKymaResource] = useState(
    cloneDeep(initialKymaResource),
  );
  const [selectedModules, setSelectedModules] = useState(
    initialKymaResource?.spec?.modules,
  );

  useEffect(() => {
    setKymaResource(cloneDeep(initialKymaResource));
    setSelectedModules(initialKymaResource?.spec?.modules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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

  const setCheckbox = (module, checked, index) => {
    if (checked) {
      selectedModules.push({
        name: module.name,
      });
    } else {
      selectedModules.splice(index, 1);
    }

    setKymaResource({
      ...kymaResource,
      spec: {
        ...kymaResource.spec,
        modules: selectedModules,
      },
    });
  };

  return (
    <ResourceForm
      {...props}
      createUrl={kymaResourceUrl}
      pluralKind={'kymas'}
      singularName={'Kyma'}
      resource={kymaResource}
      setResource={setKymaResource}
      initialResource={initialKymaResource}
      disableDefaultFields
      formElementRef={props.formElementRef}
      onChange={props.onChange}
      layoutNumber={'StartColumn'}
      resetLayout
    >
      {modulesAddData?.length !== 0 ? (
        modulesAddData?.map(module => {
          const index = selectedModules.findIndex(kymaResourceModule => {
            return kymaResourceModule.name === module?.name;
          });
          return (
            <>
              <div className="gridbox" key={module.name}>
                <div></div>
                <CheckBox
                  style={spacing.sapUiSmallMarginTop}
                  checked={isChecked(module.name)}
                  onChange={e => {
                    setCheckbox(module, e.target.checked, index);
                  }}
                  text={module.name}
                />
                <Dropdown
                  style={spacing.sapUiTinyMarginTop}
                  label={t(
                    'extensibility.widgets.modules.module-channel-label',
                  )}
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
                  selectedKey={
                    selectedModules ? selectedModules[index]?.channel : ''
                  }
                  onSelect={(_, selected) => {
                    if (selected.key !== -1) {
                      const index = selectedModules.findIndex(
                        kymaResourceModule => {
                          return kymaResourceModule.name === module?.name;
                        },
                      );
                      selectedModules[index] = {
                        ...selectedModules[index],
                        channel: selected.key,
                      };

                      setKymaResource({
                        ...kymaResource,
                        spec: {
                          ...kymaResource.spec,
                          modules: selectedModules,
                        },
                      });
                    }
                  }}
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
        })
      ) : (
        <MessageStrip design="Warning" hideCloseButton>
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      )}
    </ResourceForm>
  );
}
