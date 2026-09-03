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
  maxSockets: 200,
  maxFreeSockets: 50,
  timeout: 60000, // Match typical load balancer timeouts
  scheduling: 'lifo',
});

// Shared keep-alive agent for outbound proxy requests (/proxy route).
// Without this, every proxied request pays a full TCP+TLS handshake (~100-200ms).
export const proxyAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000,
  scheduling: 'fifo',
});
