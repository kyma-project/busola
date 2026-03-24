import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';

import { useCurrentResource } from 'components/KymaCompanion/utils/useResource';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { getClusterConfig } from 'state/utils/getBackendInfo';

const textEncoder = new TextEncoder();

const EMPTY_ENCRYPTED_AUTH = {
  encrypted_key: null,
  client_iv: null,
  encrypted_payload: null,
  session_id: null,
};

const toBase64 = (arrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
};

const fromBase64 = (value) => {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const concatUint8Arrays = (first, second) => {
  const merged = new Uint8Array(first.length + second.length);
  merged.set(first, 0);
  merged.set(second, first.length);
  return merged;
};

const encryptClusterHeaders = async ({
  clusterUrl,
  certificateAuthorityData,
  token,
}) => {
  const clientKeys = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveBits'],
  );

  const clientPublicKeyBytes = await window.crypto.subtle.exportKey(
    'raw',
    clientKeys.publicKey,
  );

  const { backendAddress } = getClusterConfig();

  const keyExchangeResponse = await fetch(
    `${backendAddress}/ai-chat/public-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: toBase64(clientPublicKeyBytes),
      }),
    },
  );

  if (!keyExchangeResponse.ok) {
    throw new Error(
      `Failed to fetch public key: ${keyExchangeResponse.status}`,
    );
  }

  const keyExchangeData = await keyExchangeResponse.json();

  const sessionId = keyExchangeData?.session_id;
  const companionPublicKey = keyExchangeData?.companion_public_key;

  if (!sessionId || !companionPublicKey) {
    throw new Error('Invalid key exchange response');
  }

  const serverPublicKey = await window.crypto.subtle.importKey(
    'raw',
    fromBase64(companionPublicKey),
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    [],
  );

  const sharedSecret = await window.crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: serverPublicKey,
    },
    clientKeys.privateKey,
    256,
  );

  const hkdfBaseKey = await window.crypto.subtle.importKey(
    'raw',
    sharedSecret,
    'HKDF',
    false,
    ['deriveBits'],
  );

  const sharedKeyBytes = await window.crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: textEncoder.encode('ecdh-key-exchange'),
    },
    hkdfBaseKey,
    256,
  );

  const sharedAesKey = await window.crypto.subtle.importKey(
    'raw',
    sharedKeyBytes,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt'],
  );

  const payloadAesKeyBytes = window.crypto.getRandomValues(new Uint8Array(32));
  const payloadIv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyNonce = window.crypto.getRandomValues(new Uint8Array(12));

  const wrappedAesKeyCipher = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: keyNonce,
    },
    sharedAesKey,
    payloadAesKeyBytes,
  );

  const payloadAesKey = await window.crypto.subtle.importKey(
    'raw',
    payloadAesKeyBytes,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt'],
  );

  const payloadData = textEncoder.encode(
    JSON.stringify({
      'x-cluster-url': clusterUrl,
      'x-cluster-certificate-authority-data': certificateAuthorityData,
      'x-k8s-authorization': token,
    }),
  );

  const encryptedPayload = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: payloadIv,
    },
    payloadAesKey,
    payloadData,
  );

  const wrappedAesKey = concatUint8Arrays(
    keyNonce,
    new Uint8Array(wrappedAesKeyCipher),
  );

  return {
    encrypted_key: toBase64(wrappedAesKey),
    client_iv: toBase64(payloadIv),
    encrypted_payload: toBase64(encryptedPayload),
    session_id: sessionId,
  };
};

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
  const encryptedAuthRef = useRef(EMPTY_ENCRYPTED_AUTH);

  useEffect(() => {
    resourceRef.current = currentResource;
  }, [currentResource]);

  useEffect(() => {
    let isCancelled = false;

    const prepareEncryptedAuth = async () => {
      const clusterData = cluster?.currentContext?.cluster?.cluster;
      const token = authData?.token;

      if (
        !isEnabled ||
        !clusterData?.server ||
        !clusterData?.['certificate-authority-data'] ||
        !token
      ) {
        encryptedAuthRef.current = EMPTY_ENCRYPTED_AUTH;
        return;
      }

      try {
        const encryptedAuth = await encryptClusterHeaders({
          clusterUrl: clusterData.server,
          certificateAuthorityData: clusterData['certificate-authority-data'],
          token,
        });

        if (!isCancelled) {
          encryptedAuthRef.current = encryptedAuth;
        }
      } catch (error) {
        if (!isCancelled) {
          encryptedAuthRef.current = EMPTY_ENCRYPTED_AUTH;
        }

        console.error('Failed to encrypt Joule application context', error);
      }
    };

    prepareEncryptedAuth();

    return () => {
      isCancelled = true;
    };
  }, [isEnabled, cluster, authData]);

  useEffect(() => {
    if (!isEnabled || !jouleConfig?.url || !jouleConfig?.botname) {
      return;
    }

    const bridgeImpl = {
      getApplicationContext: () => {
        const resourceContext = resourceRef.current || {};
        const encryptedAuth = encryptedAuthRef.current || EMPTY_ENCRYPTED_AUTH;

        return {
          ...resourceContext,
          auth: encryptedAuth,
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
