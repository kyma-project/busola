import { WebSocketServer } from 'ws';
import { WebSocketConnection } from './connection';

// A stand-in for the intermediary that actually causes the reported bug in
// production: the GCP load balancer in front of the Busola backend drops any
// connection that sees zero traffic for its idle window, but keeps it alive if
// ANY frame — including a keepalive ping — arrives. (Kubernetes' own streaming
// idle timeout defaults to 4h, so the cluster is never the trigger.)
//
// This lets us reproduce the idle-drop deterministically and locally, with no
// cluster: the connection survives only if the backend keeps it warm.
const IDLE_MS = 300;
const HEARTBEAT_MS = 100; // faster than IDLE_MS, so pings keep the socket warm

const WS_OPEN = 1;

function createIdleClosingServer() {
  const wss = new WebSocketServer({
    port: 0,
    // Accept the k8s attach subprotocol the client offers.
    handleProtocols: (protocols) => [...protocols][0] ?? false,
  });
  const state = { connectionCount: 0 };
  wss.on('connection', (socket) => {
    state.connectionCount += 1;
    let timer;
    const armIdleTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => socket.terminate(), IDLE_MS); // abnormal 1006
    };
    // Any inbound frame resets the idle timer — data, or a keepalive ping/pong.
    socket.on('message', armIdleTimer);
    socket.on('ping', armIdleTimer);
    socket.on('pong', armIdleTimer);
    socket.on('close', () => clearTimeout(timer));
    armIdleTimer();
  });
  return { wss, state };
}

function makeMockFrontWS() {
  const listeners = {};
  return {
    readyState: WS_OPEN,
    listeners,
    addEventListener: (event, cb) => {
      listeners[event] = cb;
    },
    ping: () => {},
    send: () => {},
    close: () => {},
  };
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('WebSocketConnection survives an idle intermediary', () => {
  let wss;
  let state;
  let port;
  let frontWS;

  beforeEach(async () => {
    ({ wss, state } = createIdleClosingServer());
    await new Promise((resolve) => wss.once('listening', resolve));
    port = wss.address().port;
    frontWS = makeMockFrontWS();
  });

  afterEach(async () => {
    // Trigger the connection's own teardown (stops heartbeat, closes k8s socket).
    frontWS.listeners['close']?.();
    await new Promise((resolve) => wss.close(resolve));
  });

  it('keeps an idle connection alive via the heartbeat', async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const connection = new WebSocketConnection(
      `ws://localhost:${port}/`,
      frontWS,
      { token: 'Bearer test', protocol: 'v4.channel.k8s.io' },
      logger,
      undefined, // backoffConfig
      HEARTBEAT_MS,
    );

    connection.connect();
    // Wait well past the idle window — several heartbeat pings must land first.
    await delay(IDLE_MS * 3);

    // GREEN with the heartbeat / RED without it:
    expect(connection.k8sWS.readyState).toBe(WS_OPEN);
    expect(state.connectionCount).toBe(1); // never had to reconnect
    const reconnectAttempted = logger.info.mock.calls.some(([msg]) =>
      String(msg).includes('reconnection in'),
    );
    expect(reconnectAttempted).toBe(false);
  });
});
