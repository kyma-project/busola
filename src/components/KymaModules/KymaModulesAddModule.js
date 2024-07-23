import { useState, useEffect, useCallback } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { cloneDeep } from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ModulesCard from './ModulesCard';
import './KymaModulesAddModule.scss';

export default function KymaModulesAddModule(props) {
  const { t } = useTranslation();

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: kymaResources, loading: loadingKymaResources } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  const resourceName =
    kymaResources?.items.find(kymaResource => kymaResource?.status)?.metadata
      .name || kymaResources?.items[0]?.metadata?.name;
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
    initialKymaResource?.spec?.modules ?? [],
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
    setInitialUnchangedResource(cloneDeep(initialKymaResource));
    setKymaResource(cloneDeep(initialKymaResource));
    setSelectedModules(initialKymaResource?.spec?.modules ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
            isBeta:
              module.metadata.labels['operator.kyma-project.io/beta'] ===
              'true',
          },
        ],
        docsUrl:
          module.metadata.annotations['operator.kyma-project.io/doc-url'],
      });
    } else {
      existingModule.channels?.push({
        channel: module.spec.channel,
        version: module.spec.descriptor.component.version,
        isBeta:
          module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
      });
    }
    return acc ?? [];
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

  const setChannel = (module, channel, index) => {
    if (
      selectedModules.find(
        selectedModule => selectedModule.name === module.name,
      )
    ) {
      if (channel === 'predefined') {
        delete selectedModules[index].channel;
      } else selectedModules[index].channel = channel;
    } else {
      selectedModules.push({
        name: module.name,
      });
      if (channel !== 'predefined')
        selectedModules[selectedModules.length - 1].channel = channel;
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
            ({ channel: ch, isBeta }) => ch === channel && isBeta,
          )
        : false;
    });
  };

  const checkIfStatusModuleIsBeta = moduleName => {
    return modulesAddData
      ?.find(mod => mod.name === moduleName)
      ?.channels.some(
        ({ channel: ch, isBeta }) =>
          ch === findStatus(moduleName)?.channel && isBeta,
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
      resource={kymaResource}
      setResource={setKymaResource}
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
