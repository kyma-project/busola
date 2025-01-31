import { useCallback, useEffect, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from './ModulesCard';
import { cloneDeep } from 'lodash';
import {
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from './kymaModulesQueries';

import './KymaModulesAddModule.scss';
import { findStatus } from './support';

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

  const [resource, setResource] = useState(cloneDeep(kymaResource));

  const [selectedModules, setSelectedModules] = useState([]);

  useEffect(() => {
    if (selectedModules && kymaResource) {
      const newModules = selectedModules.filter(
        newModules =>
          !activeKymaModules.find(
            activeModules => activeModules.name === newModules.name,
          ),
      );
      const mergedModules = activeKymaModules.concat(newModules);
      setResource({
        ...kymaResource,
        spec: {
          ...kymaResource?.spec,
          modules: mergedModules,
        },
      });
    }
  }, [setKymaResource, kymaResource, selectedModules, activeKymaModules]);

  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const { data: moduleTemplates } = useModuleTemplatesQuery({
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

  const modulesAddData = moduleTemplates?.items.reduce((acc, module) => {
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
          ch === findStatus(kymaResource, moduleName)?.channel ||
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
        <MessageStrip
          design="Information"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {t('extensibility.widgets.modules.all-modules-added')}
        </MessageStrip>
      ) : (
        <MessageStrip
          design="Critical"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {t('extensibility.widgets.modules.no-modules')}
        </MessageStrip>
      )}
    </ResourceForm>
  );
}
