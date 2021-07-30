import React, { useRef, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import { useNotification } from 'react-shared';
import {
  decompressParams,
  hasKubeconfigAuth,
  getContext,
  addCluster,
} from '../../shared';

export function AddCluster() {
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const notification = useNotification();
  const isMounted = useRef();

  const toStep2Ref = useRef();
  const wizardRef = useRef();
  const fileUploaderRef = useRef();

  React.useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  useEffect(() => {
    toStep2Ref.current.addEventListener('click', () => {
      deselectAllSteps();
      moveToStep(1);
    });
    fileUploaderRef.current.addEventListener('change', async event => {
      const file = event?.target?.files[0];
      const kubeconfig = await readFile(file);
      handleKubeconfigAdded(kubeconfig);
    });

    return () => {
      toStep2Ref.current.removeEventListener('click', () => {});
      fileUploaderRef.current.removeEventListener('change', () => {});
    };
  }, []);

  const encodedParams = LuigiClient.getNodeParams().init;

  React.useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        setKubeconfig(params.kubeconfig);
      }
      notification.notify(
        {
          title:
            'Configuration has been included properly. Please fill remaining required data.',
          type: 'info',
          icon: '',
          autoClose: true,
        },
        7500,
      );
    }
    setKubeconfigIfPresentInParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedParams, initParams]);

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  function handleKubeconfigAdded(kubeconfig) {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig.contexts?.length === 1;
    const contextName = kubeconfig.contexts && kubeconfig.contexts[0]?.name;
    const hasAuth = hasKubeconfigAuth(kubeconfig, contextName);

    // skip config
    if (hasOneContext && hasAuth) {
      try {
        addCluster({
          kubeconfig,
          config: { ...initParams?.config },
          currentContext: getContext(kubeconfig, contextName),
        });
      } catch (e) {
        notification.notifyError({
          title: 'Cannot apply configuration',
          content: 'Error: ' + e.message,
        });
        console.warn(e);
      }
    } else {
      // show additional configuration
      setKubeconfig(kubeconfig);
    }
  }

  const moveToStep = idx => {
    const step = getStep(idx);
    step.selected = true;
    step.disabled = false;
  };
  const getStep = idx => {
    return Array.from(wizardRef.current.children)[idx];
  };
  const deselectAllSteps = () => {
    Array.from(wizardRef.current.children).forEach(function(step) {
      step.selected = false;
    });
  };

  return (
    <div className="wizard">
      <ui5-wizard ref={wizardRef} id="wiz">
        <ui5-wizard-step icon="product" heading="Product type" selected>
          <ui5-title>Choose configuration</ui5-title>
          <ui5-file-uploader
            ref={fileUploaderRef}
            accept=".yaml,.yml,.json"
            multiple="false"
          >
            <ui5-button icon="upload">Upload kubeconfig</ui5-button>
          </ui5-file-uploader>

          <ui5-button ref={toStep2Ref}>Step 2</ui5-button>
        </ui5-wizard-step>

        <ui5-wizard-step icon="hint" heading="Product Information" disabled>
          <ui5-title>Verify configuration</ui5-title>

          <ui5-button id="toStep3" disabled>
            Step 3
          </ui5-button>
        </ui5-wizard-step>
      </ui5-wizard>
    </div>
  );
}
