import React, { useEffect, useState } from 'react';
import {
  Button,
  MessageStrip,
  Wizard,
  WizardStep,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { authDataState } from 'state/authDataAtom';

import { addByContext, getUser, hasKubeconfigAuth } from '../shared';
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
  const busolaClusterParams = useRecoilValue(configurationAtom);
  const { t } = useTranslation();
  const notification = useNotification();
  const clustersInfo = useClustersInfo();
  const setAuth = useSetRecoilState(authDataState);

  const [hasAuth, setHasAuth] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config?.storage || 'sessionStorage',
  );
  const [selected, setSelected] = useState(1);

  const {
    isValid: authValid,
    formElementRef: authFormRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();

  useEffect(() => {
    if (Array.isArray(kubeconfig?.contexts)) {
      if (getUser(kubeconfig)?.token) {
        setStorage('sessionStorage');
      } else {
        setStorage('localStorage');
      }
    }
  }, [kubeconfig]);

  const updateKubeconfig = kubeconfig => {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig?.contexts?.length === 1;
    const hasAuth = hasKubeconfigAuth(kubeconfig);
    setHasOneContext(hasOneContext);
    setHasAuth(hasAuth);

    setKubeconfig(kubeconfig);
  };

  const onComplete = () => {
    try {
      setAuth(null);
      const contextName = kubeconfig['current-context'];
      if (!kubeconfig.contexts?.length) {
        addByContext(
          {
            kubeconfig,
            context: {
              name: kubeconfig.clusters[0].name,
              context: {
                cluster: kubeconfig.clusters[0].name,
                user: kubeconfig.users[0].name,
              },
            },

            storage,
            config,
          },
          clustersInfo,
        );
      } else if (contextName === '-all-') {
        kubeconfig.contexts.forEach((context, index) => {
          addByContext(
            {
              kubeconfig,
              context,
              switchCluster: !index,
              storage,
              config,
            },
            clustersInfo,
          );
        });
      } else {
        const context = kubeconfig.contexts.find(
          context => context.name === contextName,
        );
        addByContext({ kubeconfig, context, storage, config }, clustersInfo);
      }
    } catch (e) {
      notification.notifyError({
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
  };

  const goToNextStep = () => {
    setSelected(selected + 1);
  };

  const goToPreviousStep = () => {
    setSelected(selected - 1);
  };

  return (
    <Wizard
      contentLayout="SingleStep"
      // className="add-cluster-wizard"
    >
      <WizardStep
        titleText={t('clusters.wizard.kubeconfig')}
        branching={!kubeconfig}
        // valid={!!kubeconfig}
        selected={selected === 1}
      >
        <p>{t('clusters.wizard.intro')}</p>
        <MessageStrip
          design="Information"
          hideCloseButton
          className="add-cluster__kubeconfig-info fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('clusters.wizard.storage-info')}
        </MessageStrip>
        <KubeconfigUpload
          kubeconfig={kubeconfig}
          setKubeconfig={updateKubeconfig}
        />
        <Button
          design="Emphasized"
          onClick={goToNextStep}
          disabled={!kubeconfig}
        >
          {t('clusters.buttons.next-step')}
        </Button>
        <Button design="Transparent" onClick={onCancel}>
          {t('common.buttons.cancel')}
        </Button>
      </WizardStep>

      {kubeconfig && (!hasAuth || !hasOneContext) && (
        <WizardStep
          titleText={t('clusters.wizard.update')}
          // valid={authValid}
          selected={selected === 2}
          disabled={selected !== 2}
        >
          <ResourceForm.Single
            formElementRef={authFormRef}
            resource={kubeconfig}
            setResource={setKubeconfig}
            setCustomValid={setCustomValid}
            createResource={e => {
              e.preventDefault();
            }}
          >
            {!hasOneContext && <ContextChooser />}
            {!hasAuth && <AuthForm revalidate={revalidate} />}
          </ResourceForm.Single>
          <Button onClick={goToPreviousStep}>
            {t('clusters.buttons.previous-step')}
          </Button>
          <Button
            design="Emphasized"
            onClick={goToNextStep}
            disabled={!authValid}
          >
            {t('clusters.buttons.next-step')}
          </Button>
          <Button design="Transparent" onClick={onCancel}>
            {t('common.buttons.cancel')}
          </Button>
        </WizardStep>
      )}

      <WizardStep
        title={t('clusters.wizard.storage')}
        // valid={!!storage}
        selected={
          kubeconfig && (!hasAuth || !hasOneContext)
            ? selected === 3
            : selected === 2
        }
        disabled={
          kubeconfig && (!hasAuth || !hasOneContext)
            ? selected !== 3
            : selected !== 2
        }
      >
        <ChooseStorage storage={storage} setStorage={setStorage} />
        <Button onClick={goToPreviousStep}>
          {t('clusters.buttons.previous-step')}
        </Button>
        <Button design="Emphasized" onClick={onComplete} disabled={!storage}>
          {t('clusters.buttons.verify-and-add')}
        </Button>
        <Button design="Transparent" onClick={onCancel}>
          {t('common.buttons.cancel')}
        </Button>
      </WizardStep>
    </Wizard>
  );
}
