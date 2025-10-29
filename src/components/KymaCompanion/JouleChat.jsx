import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';

export default function JouleChat() {
  const [showKymaCompanion] = useAtom(showKymaCompanionAtom);

  useEffect(() => {
    window.sapdas = window.sapdas || {};
    window.sapdas.webclientBridge = window.sapdas.webclientBridge || {};

    // tenant configuration
    const dasProps = {
      url: 'https://tan-eu12-ss.eu12.sapdas.cloud.sap/resources/public/webclient/bootstrap.js',
      botname: 'kyma_companion',
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
    };
  }, []);

  // Control visibility based on Jotai state
  useEffect(() => {
    if (window.sap?.das?.webclient) {
      if (showKymaCompanion) {
        window.sap.das.webclient.show();
      } else {
        window.sap.das.webclient.hide();
      }
    }
  }, [showKymaCompanion]);

  return null;
}
