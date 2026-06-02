import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { IllustratedMessage, MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from 'components/Modules/components/ModulesCard';
import { cloneDeep } from 'lodash';
import { useModulesReleaseQuery } from './kymaModulesQueries';
import { KymaModuleContext } from './providers/KymaModuleProvider';

import './KymaModulesAddModule.scss';
import { KymaResourceStatusModuleType } from './support';
import { ModuleTemplatesContext } from './providers/ModuleTemplatesProvider';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type ChannelType = {
  channel: string;
  version: string;
  isBeta?: boolean;
  isMetaRelease?: boolean;
};
type ModulesAddData = {
  name: string;
  docsUrl?: string;
  channels: ChannelType[];
  icon: {
    link?: string;
    name?: string;
  };
  isMetaRelease?: boolean;
};

export default function KymaModulesAddModule(props: ResourceFormProps) {
  const { t } = useTranslation();

  const {
    kymaResource: resourceName,
    resourceUrl: kymaResourceUrl,
    kymaResourceState: kymaResource,
    setKymaResourceState: setKymaResource,
    kymaResourceLoading: loading,
    selectedModules: activeKymaModules,
    initialUnchangedResource,
  } = useContext(KymaModuleContext);

  const { moduleTemplates } = useContext(ModuleTemplatesContext);

  const [resource, setResource] = useState(cloneDeep(kymaResource));

  const [selectedModules, setSelectedModules] = useState<
    KymaResourceStatusModuleType[]
  >([]);

  useEffect(() => {
    if (selectedModules && kymaResource) {
      const newModules = selectedModules.filter(
        (newModules) =>
          !activeKymaModules.find(
            (activeModules: any) => activeModules.name === newModules.name,
          ),
      );
      const mergedModules = activeKymaModules.concat(newModules);

      const timeoutId = setTimeout(() => {
        setResource({
          ...kymaResource,
          spec: {
            ...kymaResource?.spec,
            modules: mergedModules,
          },
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [setKymaResource, kymaResource, selectedModules, activeKymaModules]);

  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });

  const [columnsCount, setColumnsCount] = useState(2);
  const [cardsContainerRef, setCardsContainerRef] =
    useState<HTMLDivElement | null>(null);

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

  const modulesAddData = moduleTemplates?.items.reduce(
    (acc: ModulesAddData[], moduleTpl) => {
      const name =
        moduleTpl.metadata.labels['operator.kyma-project.io/module-name'];
      const existingModule = acc.find((item) => item.name === name);
      const isAlreadyInstalled = initialUnchangedResource?.spec?.modules?.find(
        (installedModule) => installedModule.name === name,
      );
      const moduleReleaseMeta = moduleReleaseMetas?.items.find(
        (item) => item.spec.moduleName === name,
      );

      const isModuleMetaRelease = acc.find(
        (item: any) => item.name === moduleReleaseMeta?.spec?.moduleName,
      );

      if (moduleTpl.spec.channel && !isModuleMetaRelease) {
        if (!existingModule && !isAlreadyInstalled) {
          acc.push({
            name: name,
            channels: [
              {
                channel: moduleTpl.spec.channel,
                version: moduleTpl.spec.descriptor.component.version,
                isBeta:
                  moduleTpl.metadata.labels['operator.kyma-project.io/beta'] ===
                  'true',
              },
            ],
            docsUrl:
              moduleTpl.metadata.annotations[
                'operator.kyma-project.io/doc-url'
              ],
            icon: {
              link: moduleTpl.spec?.info?.icons?.[0]?.link,
              name: moduleTpl.spec?.info?.icons?.[0]?.name,
            },
            isMetaRelease: false,
          });
        } else if (existingModule) {
          existingModule.channels?.push({
            channel: moduleTpl.spec.channel,
            version: moduleTpl.spec.descriptor.component.version,
            isBeta:
              moduleTpl.metadata.labels['operator.kyma-project.io/beta'] ===
              'true',
            isMetaRelease: false,
          });
        }
      } else {
        if (!existingModule && !isAlreadyInstalled) {
          moduleReleaseMeta?.spec.channels.forEach((channel) => {
            if (!acc.find((item) => item.name === name)) {
              acc.push({
                name: name,
                channels: [
                  {
                    channel: channel.channel,
                    version: channel.version,
                    isBeta: moduleReleaseMeta.spec.beta ?? false,
                    isMetaRelease: true,
                  },
                ],
                docsUrl: moduleTpl.spec.info?.documentation,
                icon: {
                  link: moduleTpl.spec?.info?.icons?.[0]?.link,
                  name: moduleTpl.spec?.info?.icons?.[0]?.name,
                },
              });
            } else {
              acc
                ?.find((item) => item?.name === name)
                ?.channels.push({
                  channel: channel.channel,
                  version: channel.version,
                  isBeta: moduleReleaseMeta.spec.beta ?? false,
                  isMetaRelease: true,
                });
            }
          });
        }
      }

      return acc ?? [];
    },
    [],
  );

  useEffect(() => {
    if (!loading && kymaResource) {
      props.setIsAddDisabled?.(
        modulesAddData?.length === 0 && !!kymaResource?.spec?.modules,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulesAddData, kymaResource?.spec?.modules]);

  if (loading || !kymaResource) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const isChecked = (name?: string) => {
    return !!selectedModules?.find((module) => module.name === name);
  };

  const setCheckbox = (
    module: Record<string, any>,
    checked: boolean,
    index: number,
  ) => {
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

  const checkIfSelectedModuleIsBeta = (moduleName?: string) => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesAddData?.find((module) => module.name === name);

      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }: ChannelType) =>
              ch === (channel || kymaResource.spec.channel) && isBeta,
          )
        : false;
    });
  };

  const checkIfStatusModuleIsBeta = (moduleName: string) => {
    return !!modulesAddData
      ?.find((mod) => mod.name === moduleName)
      ?.channels.some(({ isBeta }: ChannelType) => isBeta);
  };

  const renderCards = () => {
    const columns: ReactNode[] = Array.from({ length: columnsCount }, () => []);

    modulesAddData?.forEach((module, i) => {
      const index = selectedModules?.findIndex((kymaResourceModule) => {
        return kymaResourceModule.name === module?.name;
      });

      const card = (
        <ModulesCard
          module={module}
          kymaResource={kymaResource}
          index={index}
          key={module.name}
          isChecked={isChecked}
          setCheckbox={setCheckbox}
          selectedModules={selectedModules}
          setSelectedModules={setSelectedModules}
          checkIfStatusModuleIsBeta={checkIfStatusModuleIsBeta}
        />
      );
      (columns[i % columnsCount] as any)?.push(card);
    });

    return (
      <div
        className="gridbox-addModule sap-margin-top-small"
        ref={setCardsContainerRef}
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
      createUrl={kymaResourceUrl ?? undefined}
      pluralKind={'kymas'}
      singularName={'Kyma'}
      resource={resource}
      setResource={setResource}
      initialResource={initialUnchangedResource}
      disableDefaultFields
      layoutNumber="startColumn"
      resetLayout
      afterCreatedCustomMessage={t('kyma-modules.messages.module-added')}
      formWithoutPanel
      className="add-modules-form"
    >
      {modulesAddData?.length !== 0 ? (
        <>
          {checkIfSelectedModuleIsBeta() ? (
            <MessageStrip
              key={'beta'}
              design="Critical"
              hideCloseButton
              className="sap-margin-top-small"
            >
              {t('kyma-modules.beta-alert')}
            </MessageStrip>
          ) : null}
          {renderCards()}
        </>
      ) : kymaResource?.spec?.modules ? (
        <IllustratedMessage
          name="tnt/Components"
          design="Scene"
          key="all-modules-added"
          titleText={t('kyma-modules.all-modules-added')}
          subtitleText=" "
          className="emptyListComponent"
        ></IllustratedMessage>
      ) : (
        <IllustratedMessage
          name="tnt/Components"
          design="Scene"
          key="all-modules-added"
          titleText={t('kyma-modules.no-modules')}
          subtitleText=" "
          className="emptyListComponent"
        ></IllustratedMessage>
      )}
    </ResourceForm>
  );
}
