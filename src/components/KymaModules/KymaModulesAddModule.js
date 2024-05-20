import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CheckBox,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import './KymaModulesAddModule.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';

export default function KymaModulesAddModule(props) {
  const { t } = useTranslation();
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: kymaResources, loading: loadingKymaResources } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  const resourceName = kymaResources?.items[0].metadata.name;
  const kymaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const { data: initialKymaResource, loading } = useGet(kymaResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const [kymaResource, setKymaResource] = useState(
    cloneDeep(initialKymaResource),
  );
  const [initialUnchangedResource, setInitialUnchangedResource] = useState(
    cloneDeep(initialKymaResource),
  );
  const [selectedModules, setSelectedModules] = useState(
    initialKymaResource?.spec?.modules,
  );

  useEffect(() => {
    setInitialUnchangedResource(cloneDeep(initialKymaResource));
    setKymaResource(cloneDeep(initialKymaResource));
    setSelectedModules(initialKymaResource?.spec?.modules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading || loadingKymaResources || !kymaResource) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

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
      existingModule.isBeta =
        module.metadata.labels['operator.kyma-project.io/beta'] === 'true';
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

  const findStatus = moduleName => {
    return kymaResource?.status.modules?.find(
      module => moduleName === module.name,
    );
  };

  return (
    <ResourceForm
      {...props}
      createUrl={kymaResourceUrl}
      pluralKind={'kymas'}
      singularName={'Kyma'}
      resource={kymaResource}
      setResource={setKymaResource}
      initialResource={initialUnchangedResource}
      disableDefaultFields
      formElementRef={props.formElementRef}
      onChange={props.onChange}
      layoutNumber={'StartColumn'}
      resetLayout
      initialUnchangedResource={initialUnchangedResource}
    >
      {modulesAddData?.length !== 0 ? (
        <>
          {modulesAddData?.find(module => module?.isBeta) ? (
            <MessageStrip
              design="Warning"
              hideCloseButton
              style={spacing.sapUiSmallMarginTopBottom}
            >
              {t('kyma-modules.beta')}
            </MessageStrip>
          ) : null}
          <div className="gridbox-addModule" key={module.name}>
            {modulesAddData?.map(module => {
              const index = selectedModules?.findIndex(kymaResourceModule => {
                return kymaResourceModule.name === module?.name;
              });

              return (
                <Card
                  className="addModuleCard"
                  header={
                    <CardHeader
                      onClick={e =>
                        isChecked(module.name)
                          ? setCheckbox(module, undefined, index)
                          : setCheckbox(
                              module,
                              e.target._state.titleText,
                              index,
                            )
                      }
                      action={
                        <img
                          alt="SAP"
                          src="\assets\sap-logo.svg"
                          style={{ height: '32px' }}
                        />
                      }
                      interactive
                      avatar={<CheckBox checked={isChecked(module.name)} />}
                      titleText={module.name}
                      subtitleText={
                        findStatus(module.name)?.version
                          ? `v${findStatus(module.name)?.version} ${
                              module?.isBeta ? '(Beta)' : ''
                            }`
                          : module.channels.find(
                              channel =>
                                kymaResource?.spec?.channel === channel.channel,
                            )?.version
                          ? `v${
                              module.channels.find(
                                channel =>
                                  kymaResource?.spec?.channel ===
                                  channel.channel,
                              )?.version
                            } ${module?.isBeta ? '(Beta)' : ''}`
                          : t('kyma-modules.no-version')
                      }
                    />
                  }
                  style={spacing.sapUiSmallMarginBottom}
                >
                  {module.docsUrl ? (
                    <ExternalLink
                      url={module.docsUrl}
                      linkStyle={{
                        ...spacing.sapUiLargeMarginBegin,
                        ...spacing.sapUiSmallMarginBottom,
                      }}
                    >
                      {t('kyma-modules.learn-more')}
                    </ExternalLink>
                  ) : (
                    <div></div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <MessageStrip
          design="Warning"
          hideCloseButton
          style={spacing.sapUiSmallMarginTop}
        >
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      )}
    </ResourceForm>
  );
}
