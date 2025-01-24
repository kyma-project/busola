import { useCallback, useEffect, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from './ModulesCard';
import './KymaModulesAddModule.scss';
import { cloneDeep } from 'lodash';

export default function KymaModulesAddModule({
  resourceName,
  kymaResourceUrl,
  loading,
  activeKymaModules,
  initialUnchangedResource,
  kymaResource,
  setKymaResource,
  props,
}) {
  const { t } = useTranslation();

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const modulesReleaseMetaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/modulereleasemetas`;

  const [resource, setResource] = useState(cloneDeep(kymaResource));

  const [selectedModules, setSelectedModules] = useState(
    cloneDeep(activeKymaModules),
  );

  useEffect(() => {
    if (selectedModules && kymaResource) {
      setResource({
        ...kymaResource,
        spec: {
          ...kymaResource?.spec,
          modules: selectedModules,
        },
      });
    }
  }, [setKymaResource, kymaResource, selectedModules]);

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const { data: moduleReleaseMetas } = useGet(modulesReleaseMetaResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const [columnsCount, setColumnsCount] = useState(2);
  const [cardsContainerRef, setCardsContainerRef] = useState(null);

  const calculateColumns = useCallback(() => {
    if (cardsContainerRef?.clientWidth) {
      const containerWidth = cardsContainerRef?.clientWidth;
      const cardWidth = 350;
      const gap = 16;
      const colNumber = Math.max(
        1,
        Math.floor((containerWidth + gap) / (cardWidth + gap)),
      );
      return colNumber;
    }
    return 2;
  }, [cardsContainerRef]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setColumnsCount(calculateColumns());
    });

    if (cardsContainerRef) {
      resizeObserver.observe(cardsContainerRef);
    }

    return () => {
      if (cardsContainerRef) {
        resizeObserver.unobserve(cardsContainerRef);
      }
    };
  }, [cardsContainerRef, calculateColumns]);

  if (loading || !kymaResource) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const modulesAddData = modules?.items.reduce((acc, module) => {
    const name = module.metadata.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find(item => item.name === name);
    const isAlreadyInstalled = initialUnchangedResource?.spec?.modules?.find(
      installedModule => installedModule.name === name,
    );
    const moduleMetaRelase = moduleReleaseMetas?.items.find(
      item => item.spec.moduleName === name,
    );

    if (module.spec.channel) {
      if (!existingModule && !isAlreadyInstalled) {
        acc.push({
          name: name,
          channels: [
            {
              channel: module.spec.channel,
              version: module.spec.descriptor.component.version,
              isBeta:
                module.metadata.labels['operator.kyma-project.io/beta'] ===
                'true',
            },
          ],
          docsUrl:
            module.metadata.annotations['operator.kyma-project.io/doc-url'],
          icon: {
            link: module.spec?.info?.icons[0]?.link,
            name: module.spec?.info?.icons[0]?.name,
          },
          isMetaRelease: false,
        });
      } else if (existingModule) {
        existingModule.channels?.push({
          channel: module.spec.channel,
          version: module.spec.descriptor.component.version,
          isBeta:
            module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
          isMetaRelease: false,
        });
      }
    } else {
      if (!existingModule && !isAlreadyInstalled) {
        moduleMetaRelase?.spec.channels.forEach(channel => {
          if (!acc.find(item => item.name === name)) {
            acc.push({
              name: name,
              channels: [
                {
                  channel: channel.channel,
                  version: channel.version,
                  isBeta: moduleMetaRelase.spec.beta ?? false,
                  isMetaRelease: true,
                },
              ],
              docsUrl: module.spec.info.documentation,
              icon: {
                link: module.spec?.info?.icons[0]?.link,
                name: module.spec?.info?.icons[0]?.name,
              },
            });
          } else {
            acc
              .find(item => item.name === name)
              .channels.push({
                channel: channel.channel,
                version: channel.version,
                isBeta: moduleMetaRelase.spec.beta ?? false,
                isMetaRelease: true,
              });
          }
        });
      }
    }

    return acc ?? [];
  }, []);

  const isChecked = name => {
    return !!selectedModules?.find(module => module.name === name);
  };

  const setCheckbox = (module, checked, index) => {
    const newSelectedModules = [...selectedModules];
    if (checked) {
      newSelectedModules.push({
        name: module.name,
      });
    } else {
      newSelectedModules.splice(index, 1);
    }
    setSelectedModules(newSelectedModules);
  };

  const setChannel = (module, channel, index) => {
    const modulesToUpdate = [...selectedModules];
    if (
      selectedModules.find(
        selectedModule => selectedModule.name === module.name,
      )
    ) {
      if (channel === 'predefined') {
        delete modulesToUpdate[index].channel;
      } else modulesToUpdate[index].channel = channel;
    } else {
      modulesToUpdate.push({
        name: module.name,
      });
      if (channel !== 'predefined')
        modulesToUpdate[modulesToUpdate?.length - 1].channel = channel;
    }
    setSelectedModules(modulesToUpdate);
  };

  const findStatus = moduleName => {
    return kymaResource?.status?.modules?.find(
      module => moduleName === module.name,
    );
  };

  const findSpec = moduleName => {
    return kymaResource?.spec.modules?.find(
      module => moduleName === module.name,
    );
  };

  const checkIfSelectedModuleIsBeta = moduleName => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesAddData?.find(module => module.name === name);

      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }) =>
              ch === (channel || kymaResource.spec.channel) && isBeta,
          )
        : false;
    });
  };

  const checkIfStatusModuleIsBeta = moduleName => {
    return modulesAddData
      ?.find(mod => mod.name === moduleName)
      ?.channels.some(
        ({ channel: ch, isBeta }) =>
          ch === findStatus(moduleName)?.channel ||
          (kymaResource.spec.channel && isBeta),
      );
  };

  const renderCards = () => {
    const columns = Array.from({ length: columnsCount }, () => []);

    modulesAddData?.forEach((module, i) => {
      const index = selectedModules?.findIndex(kymaResourceModule => {
        return kymaResourceModule.name === module?.name;
      });

      const card = (
        <ModulesCard
          module={module}
          kymaResource={kymaResource}
          index={index}
          isChecked={isChecked}
          setCheckbox={setCheckbox}
          setChannel={setChannel}
          findStatus={findStatus}
          findSpec={findSpec}
          checkIfStatusModuleIsBeta={checkIfStatusModuleIsBeta}
        />
      );
      columns[i % columnsCount].push(card);
    });

    return (
      <div
        className="gridbox-addModule"
        ref={setCardsContainerRef}
        style={spacing.sapUiSmallMarginTop}
      >
        {columns.map((column, columnIndex) => (
          <div
            className={`gridbox-addModule-column column-${columnIndex}`}
            key={columnIndex}
          >
            {column}
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResourceForm
      {...props}
      createUrl={kymaResourceUrl}
      pluralKind={'kymas'}
      singularName={'Kyma'}
      resource={resource}
      setResource={setResource}
      initialResource={initialUnchangedResource}
      disableDefaultFields
      formElementRef={props.formElementRef}
      onChange={props.onChange}
      layoutNumber={'StartColumn'}
      resetLayout
      initialUnchangedResource={initialUnchangedResource}
      afterCreatedCustomMessage={t('kyma-modules.module-added')}
      formWithoutPanel
    >
      {modulesAddData?.length !== 0 ? (
        <>
          {checkIfSelectedModuleIsBeta() ? (
            <MessageStrip
              key={'beta'}
              design="Warning"
              hideCloseButton
              style={spacing.sapUiSmallMarginTop}
            >
              {t('kyma-modules.beta-alert')}
            </MessageStrip>
          ) : null}
          {renderCards()}
        </>
      ) : kymaResource?.spec?.modules ? (
        <MessageStrip
          design="Information"
          hideCloseButton
          style={spacing.sapUiSmallMarginTop}
        >
          {t('extensibility.widgets.modules.all-modules-added')}
        </MessageStrip>
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
