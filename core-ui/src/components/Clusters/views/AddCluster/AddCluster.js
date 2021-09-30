import React, { useEffect, useState, useRef } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'react-shared';

import { AddClusterWizard } from '../../components/AddClusterWizard';

import './AddCluster.scss';

export function AddCluster() {
  const { t } = useTranslation();
  const notification = useNotification();

  const [kubeconfig, setKubeconfig] = useState(undefined);
  const isMounted = useRef();

  const encodedParams = LuigiClient.getNodeParams().init;

  useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      notification.notifySuccess(
        {
          title: t('clusters.messages.missing-configuration-data'),
          type: 'info',
          icon: '',
          buttonConfirm: false,
          buttonDismiss: 'Ok',
        },
        7500,
      );
    }
    setKubeconfigIfPresentInParams();
  }, [encodedParams, initParams, notification, t]);

  return (
    <AddClusterWizard
      kubeconfig={kubeconfig}
      setKubeconfig={setKubeconfig}
      onCancel={() => {
        LuigiClient.linkManager().navigate('/clusters');
      }}
      config={initParams?.config}
    />
  );
}
