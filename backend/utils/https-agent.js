import https from 'https';

/**
 * Shared HTTPS agent with keep-alive for token-based authentication.
 * Used only for token auth (header-based) to reduce TLS handshake overhead.
 * Client certificate auth skips this agent to avoid complexity.
 */
export const tokenAuthAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000, // Detect dead connections quickly
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 60000, // Match typical load balancer timeouts
  scheduling: 'lifo',
});

export function destroyAgent() {
  tokenAuthAgent.destroy();
}
