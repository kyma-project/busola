import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';
import { Dialog, Wizard } from 'fundamental-react';

import {
  PageHeader,
  useNotification,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { AUTH_FORM_TOKEN } from '../../components/AuthForm';
import { KubeconfigUpload } from '../../components/KubeconfigUpload/KubeconfigUpload';
import {
  decompressParams,
  hasKubeconfigAuth,
  getContext,
  addCluster,
} from '../../shared';
import { ClusterConfiguration } from '../../components/ClusterConfiguration';
import { ChooseStorage } from './ChooseStorage';

export function AddCluster({ show, onCancel }) {
  const { busolaClusterParams } = useMicrofrontendContext();
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const [storage, setStorage] = React.useState(
    busolaClusterParams?.config.defaultStorage || 'localStorage',
  );
  const notification = useNotification();
  const isMounted = React.useRef();

  React.useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  const encodedParams = LuigiClient.getNodeParams().init;
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        setKubeconfig(params.kubeconfig);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedParams, initParams]);

  function handleKubeconfigAdded(kubeconfig) {
    console.log('handleKubeconfigAdded', kubeconfig);
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig.contexts?.length === 1;
    const contextName = kubeconfig.contexts && kubeconfig.contexts[0]?.name;
    const hasAuth = hasKubeconfigAuth(kubeconfig, contextName);

    // skip config
    // if (hasOneContext && hasAuth) {
    // try {
    // addCluster({
    // kubeconfig,
    // config: { ...initParams?.config, storage },
    // currentContext: getContext(kubeconfig, contextName),
    // });
    // } catch (e) {
    // notification.notifyError({
    // title: t('clusters.messages.wrong-configuration'),
    // content: t('common.tooltips.error') + e.message,
    // });
    // console.warn(e);
    // }
    // } else
    // show additional configuration
    setKubeconfig(kubeconfig);
    // }
  }

  return (
    <Dialog
      show={show}
      className="add-cluster-dialog"
      title={t('clusters.add.title')}
    >
      <Wizard onCancel={onCancel} headerSize="sm" contentSize="sm">
        <Wizard.Step
          title="Choose Configuration"
          indicator="1"
          valid={!!kubeconfig}
        >
          {/*<ChooseStorage storage={storage} setStorage={setStorage} />*/}
          <KubeconfigUpload
            onKubeconfig={setKubeconfig}
            handleKubeconfigAdded={handleKubeconfigAdded}
            kubeconfigFromParams={initParams?.kubeconfig}
            storage={storage}
            setStorage={setStorage}
          />
        </Wizard.Step>
        <Wizard.Step title="Verify Configuration" indicator="2"></Wizard.Step>
      </Wizard>
    </Dialog>
  );
}
