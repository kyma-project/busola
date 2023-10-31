import React, { useState } from 'react';
import { Button, Icon, Input } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { addCluster } from 'components/Clusters/shared';
import { useRecoilValue } from 'recoil';
import { clusterState } from 'state/clusterAtom';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { cloneDeep } from 'lodash';

import './NoPermissions.scss';

function NoPermissions() {
  const { t } = useTranslation();
  const [namespaceName, setNamespaceName] = useState('');
  const cluster = useRecoilValue(clusterState)!;
  const clustersInfo = useClustersInfo();

  const updateKubeconfig = () => {
    // make a copy since we cannot edit Recoil state value
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
      <Icon aria-label="no-permissions" name="locked" />
      <header>{t('common.errors.no-permissions-header')}</header>
      <p className="bsl-margin-top--md">{t('common.errors.no-permissions')}</p>
      <p>{t('common.errors.no-permissions-message')}</p>
      <p className="bsl-margin-top--md bsl-margin-bottom--sm">
        {t('no-permissions.enter-namespace-name')}
      </p>
      <form className="bsl-display-flex" onSubmit={updateKubeconfig}>
        <Input
          className="bsl-margin--none"
          placeholder={t('no-permissions.enter-namespace-name-placeholder')}
          value={namespaceName}
          onInput={(e: any) => setNamespaceName(e.target.typedInValue)}
        />
        <Button
          design="Emphasized"
          className="update-namespace-button"
          disabled={!namespaceName}
        >
          {t('common.buttons.save')}
        </Button>
      </form>
    </section>
  );
}

export default NoPermissions;
