import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import LuigiClient from '@luigi-project/client';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { BusolaExtensionCreate } from './BusolaExtensionCreate';

export function BusolaPluginList(props) {
  console.log('BusolaPluginList');
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.namespace'),
      value: resource => resource.metadata.namespace,
    },
  ];

  const description = (
    <Trans i18nKey="extensibility.extensions.description">
      <Link
        className="fd-link"
        url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
      />
    </Trans>
  );

  // allowSlashShortcut: true
  // hasDetailsView: true
  // i18n: I18n {observers: {…}, options: {…}, services: {…}, logger: Logger, modules: {…}, …}
  // namespace: "dd"
  // readOnly: false

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={BusolaExtensionCreate}
      resourceTitle={t('extensibility.title')}
      resourceType="ConfigMaps"
      resourceUrl="/api/v1/configmaps?labelSelector=busola.io/extension=resource"
      hasDetailsView={true}
      navigateFn={extension => {
        console.log(
          'navigate to',
          `details/${extension.metadata.namespace}/${extension.metadata.name}`,
        );
        LuigiClient.linkManager()
          .fromContext('busolaextensions')
          .navigate(
            `/details/${extension.metadata.namespace}/${extension.metadata.name}`,
          );
        // LuigiClient.sendCustomMessage({ id: 'busola.refreshNavigation' });
      }}
      // busola.io/extension=resource
    />
  );
}
export default BusolaPluginList;
