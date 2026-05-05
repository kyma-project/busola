import crypto from 'crypto';

export function hashCredential(credential, prefix) {
  return (
    prefix +
    ':' +
    crypto.createHash('sha256').update(credential).digest('hex').slice(0, 32)
  );
}

function tryParseBody(req) {
  try {
    if (typeof req.body === 'object' && !ArrayBuffer.isView(req.body)) {
      return req.body;
    }
    if (req.body) {
      return JSON.parse(req.body.toString());
    }
  } catch (_) {
    // ignore — extractors must not throw
  }
  return null;
}

export function getK8sCredentialFromHeaders(req) {
  return (
    req.headers['x-k8s-authorization'] ||
    req.headers['x-client-certificate-data']
  );
}

export function getK8sCredentialFromBody(req) {
  const parsed = tryParseBody(req);
  return parsed?.clusterToken || parsed?.clientCertificateData;
}

// Reject before the rate limiter when no credential is present, so a missing
// credential cannot fall back to req.ip and become a global throttle key.
export function requireCredential(extractCredential) {
  return function (req, res, next) {
    if (!extractCredential(req)) {
      res.status(400).json({ error: 'Missing K8s credentials.' });
      return;
    }
    next();
  };
}
