import { getClusterConfig } from 'state/utils/getBackendInfo';

const textEncoder = new TextEncoder();

interface SessionKeys {
  sharedAesKey: CryptoKey;
  sessionId: string;
}

interface AuthPayload {
  token?: string;
  clientCertificateData?: string;
  clientKeyData?: string;
}

interface ClusterAuth {
  clusterUrl: string;
  certificateAuthorityData: string;
  auth: AuthPayload;
}

export interface EncryptedAuth {
  encrypted_key: string;
  client_iv: string;
  encrypted_payload: string;
  session_id: string;
}

// Module-level cache — persists for the dashboard session
let cachedSession: SessionKeys | null = null;
let pendingKeyExchange: Promise<SessionKeys> | null = null;

export function clearSessionKeys(): void {
  cachedSession = null;
  pendingKeyExchange = null;
}

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function concatBuffers(
  first: Uint8Array,
  second: Uint8Array,
): Uint8Array<ArrayBuffer> {
  const merged = new Uint8Array(first.length + second.length);
  merged.set(first, 0);
  merged.set(second, first.length);
  return merged;
}

async function performKeyExchange(): Promise<SessionKeys> {
  const clientKeys = await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  );

  const clientPublicKeyBytes = await window.crypto.subtle.exportKey(
    'raw',
    clientKeys.publicKey,
  );

  const { backendAddress } = getClusterConfig();

  const response = await fetch(`${backendAddress}/ai-chat/public-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: toBase64(clientPublicKeyBytes) }),
  });

  if (!response.ok) {
    throw new Error(`Key exchange failed: ${response.status}`);
  }

  const data = await response.json();
  const sessionId: string = data?.session_id;
  const companionPublicKeyB64: string = data?.companion_public_key;

  if (!sessionId || !companionPublicKeyB64) {
    throw new Error('Invalid key exchange response');
  }

  const serverPublicKey = await window.crypto.subtle.importKey(
    'raw',
    fromBase64(companionPublicKeyB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  const sharedSecret = await window.crypto.subtle.deriveBits(
    { name: 'ECDH', public: serverPublicKey },
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
      salt: new Uint8Array(0) as Uint8Array<ArrayBuffer>,
      info: textEncoder.encode('ecdh-key-exchange'),
    },
    hkdfBaseKey,
    256,
  );

  const sharedAesKey = await window.crypto.subtle.importKey(
    'raw',
    sharedKeyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );

  return { sharedAesKey, sessionId };
}

/**
 * Ensures a key exchange has been performed. Returns cached session
 * if one exists, otherwise performs the ECDH exchange.
 * Called once per session on first Joule interaction.
 */
export async function ensureKeyExchange(): Promise<SessionKeys> {
  if (cachedSession) {
    return cachedSession;
  }
  if (pendingKeyExchange) {
    return pendingKeyExchange;
  }
  pendingKeyExchange = performKeyExchange().then((session) => {
    cachedSession = session;
    pendingKeyExchange = null;
    return session;
  });
  return pendingKeyExchange;
}

/**
 * Encrypts cluster auth data using the session's shared key.
 * Generates a fresh AES-256 key + IV on every call to satisfy
 * the server's replay-attack protection.
 */
export async function encryptAuthPayload(
  cluster: ClusterAuth,
): Promise<EncryptedAuth> {
  const session = await ensureKeyExchange();

  // Build payload supporting both token and certificate auth
  const payloadObj: Record<string, string> = {
    'x-cluster-url': cluster.clusterUrl,
    'x-cluster-certificate-authority-data': cluster.certificateAuthorityData,
  };

  if (cluster.auth.token) {
    payloadObj['x-k8s-authorization'] = cluster.auth.token;
  }
  if (cluster.auth.clientCertificateData) {
    payloadObj['x-client-certificate-data'] =
      cluster.auth.clientCertificateData;
  }
  if (cluster.auth.clientKeyData) {
    payloadObj['x-client-key-data'] = cluster.auth.clientKeyData;
  }

  // Fresh AES key + IV per call
  const aesKeyBytes = window.crypto.getRandomValues(
    new Uint8Array(32),
  ) as Uint8Array<ArrayBuffer>;
  const payloadIv = window.crypto.getRandomValues(
    new Uint8Array(12),
  ) as Uint8Array<ArrayBuffer>;
  const keyNonce = window.crypto.getRandomValues(
    new Uint8Array(12),
  ) as Uint8Array<ArrayBuffer>;

  // Wrap the per-message AES key with the session shared key
  const wrappedAesKeyCipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: keyNonce },
    session.sharedAesKey,
    aesKeyBytes,
  );

  // Import per-message AES key for payload encryption
  const payloadAesKey = await window.crypto.subtle.importKey(
    'raw',
    aesKeyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );

  const payloadData = textEncoder.encode(JSON.stringify(payloadObj));

  const encryptedPayload = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: payloadIv },
    payloadAesKey,
    payloadData,
  );

  const wrappedAesKey = concatBuffers(
    keyNonce,
    new Uint8Array(wrappedAesKeyCipher),
  );

  return {
    encrypted_key: toBase64(wrappedAesKey),
    client_iv: toBase64(payloadIv),
    encrypted_payload: toBase64(encryptedPayload),
    session_id: session.sessionId,
  };
}
