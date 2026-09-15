import { WebSocketConnection } from './connection';
import { WebSocket } from 'ws';

// Mock the `ws` module so no real sockets are opened. Each `new WebSocket()`
// (the upstream k8s socket) yields a stub with the methods the proxy touches.
vi.mock('ws', () => {
  const WebSocket = vi.fn().mockImplementation(function () {
    this.readyState = 1; // OPEN
    this.listeners = {};
    this.addEventListener = vi.fn((event, cb) => {
      this.listeners[event] = cb;
    });
    this.ping = vi.fn();
    this.send = vi.fn();
    this.close = vi.fn();
  });
  WebSocket.OPEN = 1;
  return { WebSocket };
});

const HEARTBEAT_INTERVAL_MS = 30_000;

function makeMockFrontWS() {
  const listeners = {};
  return {
    readyState: WebSocket.OPEN,
    listeners,
    addEventListener: vi.fn((event, cb) => {
      listeners[event] = cb;
    }),
    ping: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
  };
}

const logger = { info: vi.fn(), error: vi.fn() };
const authHeaders = {
  token: 'Bearer XYZ',
  ca: 'CACERT',
  protocol: 'v4.channel.k8s.io',
};

describe('WebSocketConnection heartbeat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pings both the frontend and k8s sockets on the heartbeat interval', () => {
    const frontWS = makeMockFrontWS();
    const connection = new WebSocketConnection(
      'wss://cluster/attach',
      frontWS,
      authHeaders,
      logger,
    );

    connection.connect();
    const k8sWS = WebSocket.mock.instances[0];

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    expect(frontWS.ping).toHaveBeenCalledTimes(1);
    expect(k8sWS.ping).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    expect(frontWS.ping).toHaveBeenCalledTimes(2);
    expect(k8sWS.ping).toHaveBeenCalledTimes(2);
  });

  it('does not ping a socket that is not open', () => {
    const frontWS = makeMockFrontWS();
    const connection = new WebSocketConnection(
      'wss://cluster/attach',
      frontWS,
      authHeaders,
      logger,
    );

    connection.connect();
    const k8sWS = WebSocket.mock.instances[0];
    k8sWS.readyState = 3; // CLOSED

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    expect(frontWS.ping).toHaveBeenCalledTimes(1);
    expect(k8sWS.ping).not.toHaveBeenCalled();
  });

  it('stops the heartbeat once the frontend socket closes', () => {
    const frontWS = makeMockFrontWS();
    const connection = new WebSocketConnection(
      'wss://cluster/attach',
      frontWS,
      authHeaders,
      logger,
    );

    connection.connect();

    // Simulate the browser disconnecting.
    frontWS.listeners['close']();
    frontWS.ping.mockClear();

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);

    expect(frontWS.ping).not.toHaveBeenCalled();
  });
});
