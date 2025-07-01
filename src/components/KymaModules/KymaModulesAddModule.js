import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from 'components/KymaModules/components/ModulesCard';
import { cloneDeep } from 'lodash';
import { useModulesReleaseQuery } from './kymaModulesQueries';
import { KymaModuleContext } from './providers/KymaModuleProvider';

import './KymaModulesAddModule.scss';
import { findModuleStatus, getModulesAddData } from './support';
import { ModuleTemplatesContext } from './providers/ModuleTemplatesProvider';

export default function KymaModulesAddModule(props) {
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

  const isAlreadyInstalled = name =>
    initialUnchangedResource?.spec?.modules?.find(
      installedModule => installedModule.name === name,
    );
  const modulesAddData = useMemo(
    () =>
      getModulesAddData(
        moduleTemplates,
        moduleReleaseMetas,
        isAlreadyInstalled,
      ),
    [moduleTemplates, moduleReleaseMetas], // eslint-disable-line react-hooks/exhaustive-deps
  );

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
          ch === findModuleStatus(kymaResource, moduleName)?.channel ||
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
      layoutNumber="startColumn"
      resetLayout
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
