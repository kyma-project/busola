import React, { useState } from 'react';
import { Button, Icon, Input, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { addCluster } from 'components/Clusters/shared';
import { useAtomValue } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { cloneDeep } from 'lodash';

import './NoPermissions.scss';

function NoPermissions() {
  const { t } = useTranslation();
  const [namespaceName, setNamespaceName] = useState('');
  const cluster = useAtomValue(clusterAtom)!;
  const clustersInfo = useClustersInfo();

  const updateKubeconfig = () => {
    // make a copy since we cannot edit state value
    const updatedCluster = cloneDeep(cluster)!;
    const contextName = updatedCluster.kubeconfig['current-context'];
    const context =
      updatedCluster.kubeconfig.contexts?.find(
        ctx => ctx.name === contextName,
      ) || updatedCluster.kubeconfig.contexts?.[0];

    context.context.namespace = namespaceName;
    updatedCluster.currentContext.namespace = namespaceName;

    addCluster(updatedCluster, clustersInfo, true);
  };

  return (
    <section className="no-permissions">
      <Icon accessibleName="no-permissions" name="locked" />
      <header>{t('common.errors.no-permissions-header')}</header>
      <Text className="sap-margin-top-medium">
        {t('common.errors.no-permissions')}
      </Text>
      <Text>{t('common.errors.no-permissions-message')}</Text>
      <Text className="sap-margin-y-medium">
        {t('no-permissions.enter-namespace-name')}
      </Text>
      <form className="bsl-display-flex">
        <Input
          className="no-margin"
          placeholder={t('no-permissions.enter-namespace-name-placeholder')}
          value={namespaceName}
          onInput={(e: any) => setNamespaceName(e.target.typedInValue)}
        />
        <Button
          design="Emphasized"
          className="update-namespace-button"
          disabled={!namespaceName}
          onClick={() => updateKubeconfig()}
        >
          {t('common.buttons.save')}
        </Button>
      </form>
    </section>
  );
}

export default NoPermissions;
