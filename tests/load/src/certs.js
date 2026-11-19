import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(here, '..', '.certs');
const certPath = path.join(certDir, 'upstream-cert.pem');
const keyPath = path.join(certDir, 'upstream-key.pem');

/**
 * Return a self-signed cert/key for the controlled HTTPS upstream (CN
 * localhost, SAN localhost + 127.0.0.1). Generated once via openssl into the
 * git-ignored `.certs/` dir and cached. The cert doubles as its own CA: the
 * backend trusts the upstream by receiving this cert, base64-encoded, in the
 * `x-cluster-certificate-authority-data` header — the bundled certs.pem is
 * never touched.
 */
export function getUpstreamCert() {
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    fs.mkdirSync(certDir, { recursive: true });
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        keyPath,
        '-out',
        certPath,
        '-days',
        '365',
        '-subj',
        '/CN=localhost',
        '-addext',
        'subjectAltName=DNS:localhost,IP:127.0.0.1',
      ],
      { stdio: 'ignore' },
    );
  }
  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
    certPath,
    keyPath,
  };
}
