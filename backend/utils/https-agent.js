import https from 'https';

/**
 * Shared HTTPS agent with keep-alive for token-based authentication.
 *
 * Why this is needed:
 * Without a shared agent, Node.js creates a new TCP connection + TLS handshake
 * for every request (100-200ms overhead). This agent reuses connections across
 * requests, avoiding repeated handshakes.
 *
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
