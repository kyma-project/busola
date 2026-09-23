import { WebSocketServer } from 'ws';
import { WebSocketConnection } from './connection';

// Stand-in for the GCP load balancer that drops idle connections but keeps them
// alive on any frame (incl. a ping). Reproduces the idle-drop locally.
const IDLE_MS = 300;
const HEARTBEAT_MS = 100; // faster than IDLE_MS, so pings land first

const WS_OPEN = 1;

function createIdleClosingServer() {
  const wss = new WebSocketServer({
    port: 0,
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
    // Any frame resets the idle timer.
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
    // Past the idle window; several pings must land first.
    await delay(IDLE_MS * 3);

    expect(connection.k8sWS.readyState).toBe(WS_OPEN);
    expect(state.connectionCount).toBe(1); // never reconnected
    const reconnectAttempted = logger.info.mock.calls.some(([msg]) =>
      String(msg).includes('reconnection in'),
    );
    expect(reconnectAttempted).toBe(false);
  });
});
