import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSessionKeys,
  EncryptedAuth,
  encryptAuthPayload,
} from './encryption';

const { subtle } = window.crypto;
const ECDH = { name: 'ECDH', namedCurve: 'P-521' };

const toBase64 = (buffer: ArrayBuffer) =>
  window.btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (value: string) =>
  Uint8Array.from(window.atob(value), (char) => char.charCodeAt(0));

type KeyExchangeResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

// Plays the Companion side of the key exchange so the tests can decrypt what
// the client produced.
async function createCompanion() {
  const keys = await subtle.generateKey(ECDH, false, ['deriveBits']);
  const publicKey = toBase64(await subtle.exportKey('raw', keys.publicKey));
  const requests: Record<string, any>[] = [];

  const fetchMock = vi.fn(
    async (_url: string, init: RequestInit): Promise<KeyExchangeResponse> => {
      requests.push(JSON.parse(init.body as string));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          session_id: `session-${requests.length}`,
          companion_public_key: publicKey,
        }),
      };
    },
  );

  async function decrypt(
    encrypted: EncryptedAuth,
    request = requests[requests.length - 1],
  ) {
    const clientPublicKey = await subtle.importKey(
      'raw',
      fromBase64(request.public_key),
      ECDH,
      false,
      [],
    );
    const sharedSecret = await subtle.deriveBits(
      { name: 'ECDH', public: clientPublicKey },
      keys.privateKey,
      528,
    );
    const sharedKey = await subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-384',
        salt: new Uint8Array(48),
        info: new TextEncoder().encode('ecdh-key-exchange'),
      },
      await subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey']),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    const wrappedKey = fromBase64(encrypted.encrypted_key);
    const messageKey = await subtle.importKey(
      'raw',
      await subtle.decrypt(
        { name: 'AES-GCM', iv: wrappedKey.slice(0, 12) },
        sharedKey,
        wrappedKey.slice(12),
      ),
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );
    const payload = await subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(encrypted.client_iv) },
      messageKey,
      fromBase64(encrypted.encrypted_payload),
    );
    return JSON.parse(new TextDecoder().decode(payload));
  }

  return { fetchMock, requests, decrypt };
}

const tokenCluster = {
  clusterUrl: 'https://api.cluster.example',
  certificateAuthorityData: 'ca-data',
  oidcIssuerUrl: 'https://kyma.accounts.example',
  auth: { token: 'cluster-token' },
};

describe('encryptAuthPayload', () => {
  let companion: Awaited<ReturnType<typeof createCompanion>>;

  beforeEach(async () => {
    clearSessionKeys();
    companion = await createCompanion();
    vi.stubGlobal('fetch', companion.fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exchanges keys and returns token auth that the Companion can decrypt', async () => {
    const encrypted = await encryptAuthPayload(tokenCluster);

    expect(companion.fetchMock).toHaveBeenCalledTimes(1);
    expect(companion.fetchMock.mock.calls[0][0]).toBe(
      '/backend/ai-chat/public-key',
    );
    expect(companion.requests[0]).toEqual({
      public_key: expect.any(String),
      clusterUrl: 'https://api.cluster.example',
      oidcIssuerUrl: 'https://kyma.accounts.example',
      isCertAuth: false,
    });
    expect(encrypted.session_id).toBe('session-1');
    expect(await companion.decrypt(encrypted)).toEqual({
      'x-cluster-url': 'https://api.cluster.example',
      'x-cluster-certificate-authority-data': 'ca-data',
      'x-k8s-authorization': 'cluster-token',
    });
  });

  it('marks certificate auth in the key exchange and encrypts the certificate pair', async () => {
    const encrypted = await encryptAuthPayload({
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      auth: { clientCertificateData: 'cert', clientKeyData: 'key' },
    });

    expect(companion.requests[0].isCertAuth).toBe(true);
    expect(await companion.decrypt(encrypted)).toEqual({
      'x-cluster-url': 'https://api.cluster.example',
      'x-cluster-certificate-authority-data': 'ca-data',
      'x-client-certificate-data': 'cert',
      'x-client-key-data': 'key',
    });
  });

  it('treats a token with a certificate pair as token auth', async () => {
    await encryptAuthPayload({
      ...tokenCluster,
      auth: {
        token: 'cluster-token',
        clientCertificateData: 'cert',
        clientKeyData: 'key',
      },
    });

    expect(companion.requests[0].isCertAuth).toBe(false);
  });

  it('reuses the session but encrypts every payload with a fresh key and IV', async () => {
    const first = await encryptAuthPayload(tokenCluster);
    const second = await encryptAuthPayload(tokenCluster);

    expect(companion.fetchMock).toHaveBeenCalledTimes(1);
    expect(second.session_id).toBe(first.session_id);
    expect(second.encrypted_key).not.toBe(first.encrypted_key);
    expect(second.client_iv).not.toBe(first.client_iv);
    expect(second.encrypted_payload).not.toBe(first.encrypted_payload);
    expect(await companion.decrypt(second)).toEqual(
      await companion.decrypt(first),
    );
  });

  it('shares one key exchange between concurrent calls', async () => {
    const [first, second] = await Promise.all([
      encryptAuthPayload(tokenCluster),
      encryptAuthPayload(tokenCluster),
    ]);

    expect(companion.fetchMock).toHaveBeenCalledTimes(1);
    expect(second.session_id).toBe(first.session_id);
  });

  it('exchanges keys again after the session keys are cleared', async () => {
    await encryptAuthPayload(tokenCluster);
    clearSessionKeys();

    const encrypted = await encryptAuthPayload(tokenCluster);

    expect(companion.fetchMock).toHaveBeenCalledTimes(2);
    expect(encrypted.session_id).toBe('session-2');
    expect(await companion.decrypt(encrypted)).toMatchObject({
      'x-k8s-authorization': 'cluster-token',
    });
  });

  it('rejects when the key exchange request fails', async () => {
    companion.fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({}),
    });

    await expect(encryptAuthPayload(tokenCluster)).rejects.toThrow(
      'Key exchange failed: 403',
    );
  });

  it.each([
    ['session id', { companion_public_key: 'a2V5' }],
    ['Companion public key', { session_id: 'session-1' }],
  ])(
    'rejects when the key exchange response has no %s',
    async (_, response) => {
      companion.fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => response,
      });

      await expect(encryptAuthPayload(tokenCluster)).rejects.toThrow(
        'Invalid key exchange response',
      );
    },
  );
});
