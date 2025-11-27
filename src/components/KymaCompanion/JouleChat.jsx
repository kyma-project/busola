import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';

import { useCurrentResource } from 'components/KymaCompanion/utils/useResource';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';

export default function JouleChat() {
  const [showKymaCompanion, setShowKymaCompanion] = useAtom(
    showKymaCompanionAtom,
  );

  const { isEnabled, jouleConfig } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  const currentResource = useCurrentResource();
  const resourceRef = useRef(currentResource);
  useEffect(() => {
    resourceRef.current = currentResource;
  }, [currentResource]);

  useEffect(() => {
    if (!isEnabled || !jouleConfig?.url || !jouleConfig?.botname) {
      return;
    }

    const dasProps = {
      url: jouleConfig.url,
      botname: jouleConfig.botname,
    };

    window.sapdas = window.sapdas || {};
    window.sapdas.webclientBridge = window.sapdas.webclientBridge || {};

    window.sapdas.webclientBridge.onClose = () => {
      setShowKymaCompanion((prevState) => ({
        ...prevState,
        show: false,
      }));
    };

    const myBridgeImpl = {
      getApplicationContext: () => {
        return resourceRef.current;
      },
      // etc
    };

    window.sapdas.webclientPreregistration =
      window.sapdas.webclientPreregistration || {};
    window.sapdas.webclientPreregistration.myAppId = {
      callbacks: myBridgeImpl,
      priority: 3, // default prio, higher values are higher prio
    };

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector(
      `script[src="${dasProps.url}"]`,
    );
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = dasProps.url;
    script.setAttribute('data-bot-name', dasProps.botname);
    script.setAttribute('data-expander-type', 'CUSTOM');

    script.onload = () => {
      console.log('Joule Web Client loaded successfully');
    };

    script.onerror = () => {
      console.error('Failed to load Joule Web Client');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window.sapdas?.webclientBridge) {
        delete window.sapdas.webclientBridge.onClose;
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
