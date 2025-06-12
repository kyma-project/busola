import { useCallback, useContext, useEffect, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from 'components/KymaModules/components/ModulesCard';
// import { cloneDeep } from 'lodash';
import { useModulesReleaseQuery } from './kymaModulesQueries';
import { CommunityModuleContext } from './providers/CommunityModuleProvider';

import './KymaModulesAddModule.scss';
import { ModuleTemplatesContext } from './providers/ModuleTemplatesProvider';

export default function CommunityModulesAddModule(props) {
  const { t } = useTranslation();

  const {
    installedCommunityModules,
    communityModulesLoading,
    setOpenedModuleIndex: setOpenedCommunityModuleIndex,
  } = useContext(CommunityModuleContext);
  const { communityModuleTemplates: moduleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const [selectedModules, setSelectedModules] = useState([]);
  const [resourcesToAply, setResourcesToAply] = useState([]);

  let modulesAddData;

  useEffect(() => {
    const getModuleResourcesLinks = (selectedModules, modulesAddData) => {
      const resources = [];

      selectedModules.forEach(({ name, channel, version }) => {
        const moduleData = modulesAddData?.find(module => module.name === name);

        if (moduleData) {
          moduleData.channels.forEach(
            ({ channel: ch, version: v, resources: r }) => {
              const resource = r.find(res => v === version && ch === channel);
              if (resource?.link) {
                resources.push(resource.link);
              }
            },
          );
        }
      });

      return resources;
    };

    setResourcesToAply(getModuleResourcesLinks());
  }, [selectedModules, modulesAddData]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: moduleReleaseMetas } = useModulesReleaseQuery({});

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

  if (communityModulesLoading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  modulesAddData = moduleTemplates?.items.reduce((acc, module) => {
    const name = module.metadata.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find(item => {
      return item.metadata.name === name;
    });
    const isAlreadyInstalled = installedCommunityModules.find(
      installedModule => installedModule.name === name,
    );

    const moduleMetaRelase = moduleReleaseMetas?.items.find(
      item => item.spec.moduleName === name,
    );
    //TODO probably not needed
    // if (module.spec.channel) {
    //   console.log('if module.spec.channel');
    //   if (!existingModule && !isAlreadyInstalled) {
    //     acc.push({
    //       name: name,
    //       channels: [
    //         {
    //           channel: module.spec.channel,
    //           version: module.spec.descriptor.component.version,
    //           isBeta:
    //             module.metadata.labels['operator.kyma-project.io/beta'] ===
    //             'true',
    //         },
    //       ],
    //       docsUrl:
    //         module.metadata.annotations['operator.kyma-project.io/doc-url'],
    //       icon: {
    //         link: module.spec?.info?.icons[0]?.link,
    //         name: module.spec?.info?.icons[0]?.name,
    //       },
    //       isMetaRelease: false,
    //     });
    //   } else if (existingModule) {
    //     existingModule.channels?.push({
    //       channel: module.spec.channel,
    //       version: module.spec.descriptor.component.version,
    //       isBeta:
    //         module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
    //       isMetaRelease: false,
    //     });
    //   }
    // } else {

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
                resources: module.spec.resources,
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
              resources: module.spec.resources,
            });
        }
      });
    }
    //TODO probably not needed
    // }

    return acc ?? [];
  }, []);

  const isChecked = name => {
    return !!selectedModules?.find(module => module.name === name);
  };

  const setCheckbox = (module, checked, index) => {
    console.log('setCheckbox');

    const newSelectedModules = [...selectedModules];
    if (checked) {
      console.log('checked');
      newSelectedModules.push({
        name: module.name,
      });
    } else {
      newSelectedModules.splice(index, 1);
    }
    console.log('newSelectedModules', newSelectedModules);
    setSelectedModules(newSelectedModules);
  };

  const checkIfSelectedModuleIsBeta = moduleName => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesAddData?.find(module => module.name === name);

      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }) => ch === channel && isBeta,
          )
        : false;
    });
  };

  const checkIfStatusModuleIsBeta = moduleName => {
    return modulesAddData
      ?.find(mod => mod.name === moduleName)
      ?.channels.some(({ channel: ch, isBeta }) => ch && isBeta);
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
          index={index}
          key={module.name}
          isChecked={isChecked}
          setCheckbox={setCheckbox}
          selectedModules={selectedModules}
          setSelectedModules={setSelectedModules}
          checkIfStatusModuleIsBeta={checkIfStatusModuleIsBeta}
        />
      );
      columns[i % columnsCount].push(card);
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
      disableDefaultFields
      formElementRef={props.formElementRef}
      onChange={props.onChange}
      layoutNumber="startColumn"
      resetLayout
      afterCreatedCustomMessage={t('kyma-modules.module-added')}
      formWithoutPanel
      className="add-modules-form"
      // onSubmit={ handleSubmit}
      onSubmit={newData => {
        console.log(
          'handling Install Community module',
          selectedModules,
          'modulesAddData',
          modulesAddData,
        );
        const newModules = selectedModules.filter(
          newModules =>
            !installedCommunityModules.find(
              activeModules => activeModules.name === newModules.name,
            ),
        );
        const selectedModulesData1 = modulesAddData.filter(
          newModules =>
            !selectedModules.find(
              activeModules => activeModules.name === newModules.name,
            ),
        );
        const selectedModulesData = modulesAddData.filter(newModules => {
          return !selectedModules.find(activeModules => {
            console.log('activeModules', activeModules, newModules);
            return activeModules.name === newModules.name;
          });
        });

        console.log('selectedModulesData', selectedModulesData);
      }}
    >
      <>
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
        ) : (
          <MessageStrip
            design="Critical"
            hideCloseButton
            className="sap-margin-top-small"
          >
            {t('extensibility.widgets.modules.no-community-modules')}
          </MessageStrip>
        )}
      </>
    </ResourceForm>
  );
}
