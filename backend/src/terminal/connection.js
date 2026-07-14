/* global Math */

import { WebSocket } from 'ws';

const Stream = Object.freeze({
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
});

export class WebSocketConnection {
  #reconnectionAttempts = 0;

  constructor(remoteURL, frontWS, authHeaders, logger, backoffConfig) {
    this.remoteURL = remoteURL;
    this.frontWS = frontWS;
    this.k8sWS = null;
    this.logger = logger;
    this.authHeaders = authHeaders;
    this.maxReconnectionAttemps = backoffConfig?.maxReconnectionAttemps || 3;
    this.baseDelay = backoffConfig?.baseDelay || 1_000;
    this.maxDelay = backoffConfig?.maxDelay || 10_000;
  }

  #nextExponentialDelay() {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.#reconnectionAttempts),
      this.maxDelay,
    );
    const jitter = delay * 0.2 * Math.random();
    return delay + jitter;
  }

  #reconnect() {
    if (this.#reconnectionAttempts >= this.maxReconnectionAttemps) {
      this.logger.info(
        'Max reconnection attempts reached for: ' + this.remoteURL,
      );
      return;
    }
    const delay = this.#nextExponentialDelay();
    this.logger.info('reconnection in: ' + delay.toFixed(4) + '[ms]');
    this.frontWS.send(
      this.#encodeMsg(
        'Trying to reconnect to backend in ' + delay.toFixed(4) + '....',
      ),
    );

    setTimeout(() => {
      this.#reconnectionAttempts++;
      this.connect();
    }, delay);
  }

  connect() {
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
    this.#startMessageProxy();
  }

  #startMessageProxy() {
    this.k8sWS.addEventListener('open', () => {
      // TODO: Currently the busola terminal uses default service account which has 0 permissions to access k8s api.
      // We can try to build kubeconfig and add it to env
      // TODO: This is a help command executed at the begining of connection, we can change or remove it completely.
      this.#reconnectionAttempts = 0;
      this.k8sWS.send(this.#encodeMsg('date'));
    });

    this.k8sWS.addEventListener('message', (event) => {
      if (this.frontWS.readyState === WebSocket.OPEN) {
        const data = event.data;
        this.frontWS.send(data);
      } else {
        this.logger.info(
          'Front WS is not open, cannot send message, status: ' +
            this.frontWS.readyState,
        );
      }
    });

    this.k8sWS.addEventListener('error', (event) => {
      this.logger.error({ err: event }, 'K8s WebSocket error: ');
    });

    this.k8sWS.addEventListener('close', (event) => {
      // Abnormal closure || Internal Server Error
      if (event.code === 1006 || event.code === 1011) {
        this.k8sWS.close();
        this.#reconnect();
        return;
      }
      this.logger.info('K8s WebSocket closed, reason:' + event.code);
      const closingMsg = 'Remote connection closed';
      this.frontWS.send(this.#encodeMsg(closingMsg, Stream.STDOUT));
      this.frontWS.close();
    });

    this.frontWS.addEventListener('error', (event) => {
      this.logger.error({ err: event }, 'Front WebSocket error: ');
    });

    this.frontWS.addEventListener('message', (event) => {
      if (this.k8sWS.readyState === WebSocket.OPEN) {
        const data = event.data;
        this.k8sWS.send(data);
      } else {
        this.logger.info(
          'K8s WS is not open, cannot send message, status: ' +
            this.k8sWS.readyState,
        );
      }
    });

    this.frontWS.addEventListener('close', () => this.k8sWS.close());
  }

  #encodeMsg(input, std = Stream.STDIN) {
    const msgEncoded = Buffer.from(input + '\n', 'utf-8');
    const encodedMsgForK8s = new Uint8Array(msgEncoded.length + 1);
    encodedMsgForK8s[0] = std; // set STD[IN,OUT,ERR]
    encodedMsgForK8s.set(msgEncoded, 1);
    return encodedMsgForK8s;
  }

  close(msg) {
    if (msg) {
      this.frontWS.close(
        1011,
        encodeMsg('Internal Server Error', Stream.STDOUT),
      );
    }
  }
}
