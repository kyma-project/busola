import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { Button, Dialog } from 'fundamental-react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { BusolaExtensionCreate } from './BusolaExtensionCreate';

export function BusolaPluginList(props) {
  const { t } = useTranslation();

  const [showWizard, setShowWizard] = useState(false);

  const customColumns = [
    {
      header: t('common.headers.namespace'),
      value: resource => resource.metadata.namespace,
    },
  ];

  const description = (
    <Trans i18nKey="extensibility.description">
      <Link
        className="fd-link"
        url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
      />
    </Trans>
  );

  return (
    <>
      {/*
      <Dialog
        show={showWizard}
        className="extensibility-wizard"
        title={t('extensibility.wizard.title')}
        actions={[]}
      >
        <ErrorBoundary>
          <BusolaExtensionCreate onCancel={() => setShowWizard(false)} />
        </ErrorBoundary>
      </Dialog>
      */}
      <ResourcesList
        customColumns={customColumns}
        description={description}
        // createResourceForm={BusolaExtensionCreate}
        // customCreateResourceForm
        resourceName={t('extensibility.title')}
        resourceType="ConfigMaps"
        resourceUrl="/api/v1/configmaps?labelSelector=busola.io/extension=resource"
        hasDetailsView={true}
        // extraHeaderContent={<Button>???</Button>}
        listHeaderActions={[
          <Button
            glyph="add"
            option="transparent"
            onClick={() =>
              LuigiClient.linkManager()
                .fromContext('busolaextensions')
                .navigate('/create')
            }
          >
            {t('extensibility.create')}
          </Button>,
        ]}
        navigateFn={extension => {
          LuigiClient.linkManager()
            .fromContext('busolaextensions')
            .navigate(
              `/details/${extension.metadata.namespace}/${extension.metadata.name}`,
            );
        }}
      />
    </>
  );
}
export default BusolaPluginList;
