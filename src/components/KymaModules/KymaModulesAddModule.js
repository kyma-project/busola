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

export default function KymaModulesAddModule(props) {
  const { t } = useTranslation();
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: kymaResources } = useGet(
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
      initialResource={initialKymaResource}
      disableDefaultFields
      formElementRef={props.formElementRef}
      onChange={props.onChange}
      layoutNumber={'StartColumn'}
      resetLayout
      initialUnchangedResource={initialUnchangedResource}
    >
      {modulesAddData?.length !== 0 ? (
        <div className="gridbox-addModule" key={module.name}>
          {modulesAddData?.map(module => {
            const index = selectedModules?.findIndex(kymaResourceModule => {
              return kymaResourceModule.name === module?.name;
            });

            return (
              <>
                <Card
                  header={
                    <CardHeader
                      onClick={e =>
                        setCheckbox(module, e.target._state.titleText, index)
                      }
                      interactive
                      avatar={<CheckBox checked={isChecked(module.name)} />}
                      titleText={module.name}
                      subtitleText={
                        isChecked(module.name)
                          ? `v${findStatus(module.name)?.version}`
                          : `v${
                              module.channels.find(
                                channel =>
                                  kymaResource?.spec?.channel ===
                                  channel.channel,
                              )?.version
                            }`
                      }
                    />
                  }
                  style={spacing.sapUiSmallMarginBottom}
                >
                  {module.docsUrl ? (
                    <ExternalLink
                      url={module.docsUrl}
                      linkStyle={spacing.sapUiLargeMarginBegin}
                    >
                      {'Learn more'}
                    </ExternalLink>
                  ) : null}
                  {module?.isBeta ? (
                    <MessageStrip
                      design="Warning"
                      hideCloseButton
                      style={{
                        ...spacing.sapUiTinyMarginTopBottom,
                        ...spacing.sapUiTinyMarginBegin,
                        width: 'calc(100% - 1rem)',
                      }}
                    >
                      {t('kyma-modules.beta')}
                    </MessageStrip>
                  ) : null}
                </Card>
              </>
            );
          })}
        </div>
      ) : (
        <MessageStrip design="Warning" hideCloseButton>
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      )}
    </ResourceForm>
  );
}
