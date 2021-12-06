import React, { useEffect, useState } from 'react';
import { Wizard, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import {
  useNotification,
  useMicrofrontendContext,
  useCustomFormValidator,
} from 'react-shared';

import { hasKubeconfigAuth, getUser, getContext, addCluster } from '../shared';
import { AuthForm } from './AuthForm';
import { KubeconfigUpload } from './KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { ChooseStorage } from './ChooseStorage';

import './AddClusterWizard.scss';

export function AddClusterWizard({
  kubeconfig,
  setKubeconfig,
  onCancel,
  config,
}) {
  const { busolaClusterParams } = useMicrofrontendContext();
  const { t } = useTranslation();
  const notification = useNotification();

  const [hasAuth, setHasAuth] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config?.storage || 'localStorage',
  );

  const {
    isValid: authValid,
    formElementRef: authFormRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();

  useEffect(() => {
    if (kubeconfig) {
      if (getUser(kubeconfig)?.token) {
        setStorage('sessionStorage');
      } else {
        setStorage('localStorage');
      }
    }
  }, [kubeconfig]);

  function updateKubeconfig(kubeconfig) {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig?.contexts?.length === 1;
    const hasAuth = hasKubeconfigAuth(kubeconfig);

    setHasOneContext(hasOneContext);
    setHasAuth(hasAuth);

    setKubeconfig(kubeconfig);
  }

  const onComplete = () => {
    try {
      const contextName = kubeconfig['current-context'];
      addCluster({
        kubeconfig,
        config: { ...(config || {}), storage },
        currentContext: getContext(kubeconfig, contextName),
      });
    } catch (e) {
      notification.notifyError({
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
  };
  return (
    <Wizard
      onCancel={onCancel}
      onComplete={onComplete}
      navigationType="tabs"
      headerSize="md"
      contentSize="md"
      className="add-cluster-wizard"
    >
      <Wizard.Step
        title={t('clusters.wizard.kubeconfig')}
        branching={!kubeconfig}
        indicator="1"
        valid={!!kubeconfig}
        previousLabel={t('clusters.buttons.previous-step')}
        nextLabel={t('clusters.buttons.next-step')}
      >
        <p>{t('clusters.wizard.intro')}</p>
        <MessageStrip
          type="information"
          className="add-cluster__kubeconfig-info fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('clusters.wizard.storage-info')}
        </MessageStrip>
        <KubeconfigUpload
          kubeconfig={kubeconfig}
          setKubeconfig={updateKubeconfig}
        />
      </Wizard.Step>

      {kubeconfig && (!hasAuth || !hasOneContext) && (
        <Wizard.Step
          title={t('clusters.wizard.update')}
          indicator="2"
          valid={authValid}
          previousLabel={t('clusters.buttons.previous-step')}
          nextLabel={t('clusters.buttons.next-step')}
        >
          <ResourceForm.Single
            formElementRef={authFormRef}
            resource={kubeconfig}
            setResource={setKubeconfig}
            setCustomValid={setCustomValid}
          >
            {!hasOneContext && <ContextChooser />}
            {!hasAuth && <AuthForm revalidate={revalidate} />}
          </ResourceForm.Single>
        </Wizard.Step>
      )}

      <Wizard.Step
        title={t('clusters.wizard.storage')}
        indicator="2"
        valid={!!storage}
        previousLabel={t('clusters.buttons.previous-step')}
        nextLabel={t('clusters.buttons.verify-and-add')}
      >
        <ChooseStorage storage={storage} setStorage={setStorage} />
      </Wizard.Step>
    </Wizard>
  );
}
