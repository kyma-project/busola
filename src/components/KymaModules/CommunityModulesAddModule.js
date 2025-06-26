import { useCallback, useContext, useEffect, useState } from 'react';

import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import ModulesCard from 'components/KymaModules/components/ModulesCard';

import { useModulesReleaseQuery } from './kymaModulesQueries';
import { CommunityModuleContext } from './providers/CommunityModuleProvider';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import './KymaModulesAddModule.scss';
import { ModuleTemplatesContext } from './providers/ModuleTemplatesProvider';
import {
  OPERATION_STATE_INITIAL,
  OPERATION_STATE_SUCCEEDED,
} from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
export default function CommunityModulesAddModule(props) {
  const { t } = useTranslation();
  const post = usePost();
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
  const [uploadState, setUploadState] = useState(OPERATION_STATE_INITIAL);

  const uploadResources = useUploadResources(
    resourcesToAply,
    setResourcesToAply,
    setUploadState,
    'default',
  );

  const { data: moduleReleaseMetas } = useModulesReleaseQuery({});

  const modulesAddData = moduleTemplates?.items.reduce((acc, module) => {
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

    return acc ?? [];
  }, []);

  useEffect(() => {
    const getModuleResourcesLinks = () => {
      const resources = [];

      (selectedModules || []).forEach(({ name, channel, version }) => {
        console.log('selectedModules[].forEach', name, channel, version);
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

    const resourcesLinks = getModuleResourcesLinks();
    (async function() {
      try {
        const yamls = await getAllResourcesYamls(resourcesLinks);

        setResourcesToAply(
          yamls.map(resource => {
            return { value: resource };
          }),
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedModules]); // eslint-disable-line react-hooks/exhaustive-deps

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
  async function getResourcesYamls(link) {
    if (!link) {
      console.error('No link provided for community resource');
      return false;
    }

    try {
      const response = await post('/modules/community-resource', { link });
      if (response?.length) {
        console.log('yamlFile2', response.flat());
        return response;
      }
      console.error('Empty or invalid response:', response);
      return false;
    } catch (error) {
      console.error('Error fetching data:', error);
      return false;
    }
  }
  async function getAllResourcesYamls(links) {
    if (links?.length) {
      const yamlRes = await Promise.all(
        links.map(async res => {
          if (res) {
            return await getResourcesYamls(res);
          }
        }),
      );
      console.log('!!yamlRes', yamlRes.flat());
      return yamlRes.flat();
    }
  }

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
      onSubmit={async newData => {
        console.log(
          'handling Install Community module',
          selectedModules,
          'modulesAddData',
          modulesAddData,
        );

        uploadResources();
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
