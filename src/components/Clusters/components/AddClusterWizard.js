import React, { useEffect, useState } from 'react';
import { MessageStrip, Wizard, WizardStep } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { authDataState } from 'state/authDataAtom';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

import { addByContext, getUser, hasKubeconfigAuth } from '../shared';
import { AuthForm } from './AuthForm';
import { KubeconfigUpload } from './KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { ChooseStorage } from './ChooseStorage';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';

import { spacing } from '@ui5/webcomponents-react-base';
import './AddClusterWizard.scss';

export function AddClusterWizard({ kubeconfig, setKubeconfig, config }) {
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
  const setShowWizard = useSetRecoilState(showAddClusterWizard);

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
    setShowWizard(false);
  };

  return (
    <Wizard contentLayout="SingleStep">
      <WizardStep
        titleText={t('clusters.wizard.kubeconfig')}
        branching={!kubeconfig}
        selected={selected === 1}
      >
        <p>{t('clusters.wizard.intro')}</p>
        <MessageStrip
          design="Information"
          hideCloseButton
          className="add-cluster__kubeconfig-info"
          style={spacing.sapUiSmallMarginTopBottom}
        >
          {t('clusters.wizard.storage-info')}
        </MessageStrip>
        <KubeconfigUpload
          kubeconfig={kubeconfig}
          setKubeconfig={updateKubeconfig}
        />
        <WizardButtons
          selected={selected}
          setSelected={setSelected}
          firstStep={true}
          onCancel={() => setShowWizard(false)}
          validation={!kubeconfig}
        />
      </WizardStep>

      {kubeconfig && (!hasAuth || !hasOneContext) && (
        <WizardStep
          titleText={t('clusters.wizard.update')}
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
          <WizardButtons
            selected={selected}
            setSelected={setSelected}
            onCancel={() => setShowWizard(false)}
            validation={!authValid}
          />
        </WizardStep>
      )}

      <WizardStep
        title={t('clusters.wizard.storage')}
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
        <WizardButtons
          selected={selected}
          setSelected={setSelected}
          lastStep={true}
          customFinish={t('clusters.buttons.verify-and-add')}
          validation={!storage}
          onComplete={onComplete}
          onCancel={() => setShowWizard(false)}
        />
      </WizardStep>
    </Wizard>
  );
}
