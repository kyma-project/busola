import React, { useEffect, useState, useRef } from 'react';
import { Button, Wizard, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { useNotification, useMicrofrontendContext } from 'react-shared';

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
  const [authValid, setAuthValid] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [lastStep, setLastStep] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config.defaultStorage || 'localStorage',
  );

  const authFormRef = useRef();

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
      onStepChange={(e, step, index, count) => setLastStep(index === count - 1)}
      headerSize="md"
      contentSize="md"
      footerProps={
        lastStep
          ? {
              children: (
                <Button compact option="emphasized" onClick={onComplete}>
                  {t('clusters.buttons.verify-and-add')}
                </Button>
              ),
            }
          : {}
      }
    >
      <Wizard.Step
        title={t('clusters.wizard.kubeconfig')}
        branching={!kubeconfig}
        indicator="1"
        valid={!!kubeconfig}
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
        >
          <ResourceForm.Single
            formElementRef={authFormRef}
            resource={kubeconfig}
            setResource={setKubeconfig}
            onValid={setAuthValid}
          >
            {!hasOneContext && <ContextChooser />}
            {!hasAuth && <AuthForm onValid={setAuthValid} />}
          </ResourceForm.Single>
        </Wizard.Step>
      )}

      <Wizard.Step
        title={t('clusters.wizard.storage')}
        indicator="2"
        valid={false}
      >
        <ChooseStorage storage={storage} setStorage={setStorage} />
      </Wizard.Step>
    </Wizard>
  );
}
