/* global Buffer */
import { WebSocket } from 'ws';

const Stream = Object.freeze({
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
});

const WS_CODE = Object.freeze({
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_PAYLOAD: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  INTERNAL_ERROR: 1011,
});

function encodeMsg(input, std = Stream.STDIN) {
  const msgEncoded = Buffer.from(input + '\n', 'utf-8');
  const encodedMsgForK8s = new Uint8Array(msgEncoded.length + 1);
  encodedMsgForK8s[0] = std; // set STD[IN,OUT,ERR]
  encodedMsgForK8s.set(msgEncoded, 1);
  return encodedMsgForK8s;
}

class ExponentialBackoff {
  #attempts = 0;

  constructor({ maxAttempts = 3, baseDelay = 1_000, maxDelay = 10_000 } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  reset() {
    this.#attempts = 0;
  }

  exhausted() {
    return this.#attempts >= this.maxAttempts;
  }

  next() {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.#attempts),
      this.maxDelay,
    );
    const jitter = delay * 0.2 * Math.random();
    this.#attempts++;
    return delay + jitter;
  }
}

export class WebSocketConnection {
  #backoff;
  #reconnectTimeout = null;

  constructor(remoteURL, frontWS, authHeaders, logger, backoffConfig) {
    this.remoteURL = remoteURL;
    this.frontWS = frontWS;
    this.k8sWS = null;
    this.logger = logger;
    this.authHeaders = authHeaders;
    this.#backoff = new ExponentialBackoff(backoffConfig);
  }

  connect() {
    this.#connectToK8s();
    this.#startProxyingMsgToBusola();
  }

  #connectToK8s() {
    let opts;
    if (this.authHeaders.token) {
      opts = {
        ca: this.authHeaders.ca,
        headers: {
          Authorization: this.authHeaders.token,
        },
      };
    } else {
      opts = {
        ca: this.authHeaders.ca,
        cert: this.authHeaders.clientCert,
        key: this.authHeaders.clientKey,
      };
    }
    this.k8sWS = new WebSocket(
      this.remoteURL,
      [this.authHeaders.protocol],
      opts,
    );
    this.k8sWS.addEventListener('open', () => {
      this.#backoff.reset();
      this.#sendMsg(this.k8sWS, encodeMsg('date'), 'K8s WebSocket');
    });

    this.k8sWS.addEventListener('message', (event) => {
      this.#sendMsg(this.frontWS, event.data, 'Busola WebSocket');
    });

    this.k8sWS.addEventListener('error', (event) => {
      this.logger.error({ err: event }, 'K8s WebSocket error: ');
    });

    this.k8sWS.addEventListener('close', (event) => {
      if (
        event.code === WS_CODE.ABNORMAL_CLOSURE ||
        event.code === WS_CODE.INTERNAL_ERROR
      ) {
        this.#reconnect();
        return;
      }
      this.logger.info('K8s WebSocket closed, reason:' + event.code);
      const closingMsg = 'Remote connection closed';
      this.#sendMsg(
        this.frontWS,
        encodeMsg(closingMsg, Stream.STDOUT),
        'Busola WebSocket',
      );
      this.frontWS.close();
    });
  }

  close(errMsg) {
    if (errMsg) {
      this.frontWS.close(
        WS_CODE.INTERNAL_ERROR,
        encodeMsg(errMsg, Stream.STDOUT),
      );
    } else {
      this.frontWS.close();
    }
  }

  #startProxyingMsgToBusola() {
    this.frontWS.addEventListener('error', (event) => {
      this.logger.error({ err: event }, 'Front WebSocket error: ');
    });

    this.frontWS.addEventListener('message', (event) => {
      this.#sendMsg(this.k8sWS, event.data, 'K8s WebSocket');
    });

    this.frontWS.addEventListener('close', () => {
      clearTimeout(this.#reconnectTimeout);
      this.k8sWS.close();
    });
  }

  #reconnect() {
    if (this.#backoff.exhausted()) {
      this.logger.info('Max reconnection attempts reached');
      this.close('Max reconnection attempts reached, closing');
      return;
    }
    const delay = this.#backoff.next();
    this.logger.info('reconnection in: ' + delay.toFixed(0) + '[ms]');
    this.#sendMsg(
      this.frontWS,
      encodeMsg(
        'Trying to reconnect to backend in ' + delay.toFixed(0) + '....',
      ),
      'Busola Websocket',
    );

    this.#reconnectTimeout = setTimeout(() => {
      this.#connectToK8s();
    }, delay);
  }

  #sendMsg(webSocket, data, webSocketName) {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(data);
    } else {
      this.logger.info(
        webSocketName +
          ' is not open, cannot send message, status: ' +
          webSocket.readyState,
      );
    }
  }
}
