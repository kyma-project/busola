import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';

import { useCurrentResource } from 'components/KymaCompanion/utils/useResource';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';

export default function JouleChat() {
  const [showKymaCompanion, setShowKymaCompanion] = useAtom(
    showKymaCompanionAtom,
  );
  const cluster = useAtomValue(clusterAtom);
  const authData = useAtomValue(authDataAtom);

  const { isEnabled, jouleConfig } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  const currentResource = useCurrentResource();

  const resourceRef = useRef(currentResource);
  const clusterRef = useRef(cluster);
  const authDataRef = useRef(authData);

  useEffect(() => {
    resourceRef.current = currentResource;
    clusterRef.current = cluster;
    authDataRef.current = authData;
  }, [currentResource, cluster, authData]);

  useEffect(() => {
    if (!isEnabled || !jouleConfig?.url || !jouleConfig?.botname) {
      return;
    }

    const bridgeImpl = {
      getApplicationContext: () => {
        return resourceRef.current;
      },
      getClusterAuth: () => {
        const clusterData =
          clusterRef.current?.currentContext?.cluster?.cluster;
        const auth = authDataRef.current;
        return {
          clusterUrl: clusterData?.server,
          certificateAuthorityData: clusterData?.['certificate-authority-data'],
          auth: {
            token: auth?.token,
            clientCertificateData: auth?.['client-certificate-data'],
            clientKeyData: auth?.['client-key-data'],
          },
        };
      },
      onClose: () => {
        setShowKymaCompanion((prevState) => ({
          ...prevState,
          show: false,
        }));
      },
    };

    let usedRuntimeRegistration = false;

    // Check if Web Client is already loaded (runtime registration)
    if (window.sap?.das?.webclient?.registerBridgeCallbacks) {
      // Unregister first to handle hot reload (cleanup doesn't run before re-render)
      window.sap.das.webclient.unregisterBridgeCallbacks?.('busola');
      window.sap.das.webclient.registerBridgeCallbacks(
        'busola',
        bridgeImpl,
        undefined,
        window.sap.das.webclient.CALL_PRIORITY.DEFAULT,
      );
      usedRuntimeRegistration = true;
    } else {
      // Pre-registration for when script loads later
      window.sapdas = window.sapdas || {};
      window.sapdas.webclientPreregistration =
        window.sapdas.webclientPreregistration || {};
      window.sapdas.webclientPreregistration.busola = {
        callbacks: bridgeImpl,
        priority: 3, // default prio, higher values are higher prio
      };
    }

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector(
      `script[src="${jouleConfig.url}"]`,
    );

    let script = null;

    if (!existingScript) {
      script = document.createElement('script');
      script.src = jouleConfig.url;
      script.setAttribute('data-bot-name', jouleConfig.botname);
      script.setAttribute('data-expander-type', 'CUSTOM');

      script.onerror = () => {
        console.error('Failed to load Joule Web Client');
      };

      document.head.appendChild(script);
    }

    return () => {
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Clean up registration
      if (
        usedRuntimeRegistration &&
        window.sap?.das?.webclient?.unregisterBridgeCallbacks
      ) {
        window.sap.das.webclient.unregisterBridgeCallbacks('busola');
      } else if (window.sapdas?.webclientPreregistration?.busola) {
        delete window.sapdas.webclientPreregistration.busola;
      }
    };
  }, [isEnabled, jouleConfig, setShowKymaCompanion]);

  // Control visibility based on Jotai state
  useEffect(() => {
    if (!isEnabled) return;

    const webclient = window.sap?.das?.webclient;
    if (!webclient) return;

    if (
      showKymaCompanion.show &&
      showKymaCompanion.useJoule &&
      !webclient.isOpen()
    ) {
      webclient.show();
    } else if (!showKymaCompanion.show && webclient.isOpen()) {
      webclient.hide();
    }
  }, [isEnabled, showKymaCompanion]);

  return null;
}
