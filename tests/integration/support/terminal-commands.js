// Stub the Kubernetes attach/exec WebSocket so the terminal reaches "connected"
// state without a real pod. Echoes `bin  etc  usr` when Enter (0x0D) is received
// on stdin (Kubernetes attach channel 0). Must be registered BEFORE the WebSocket
// is opened, since opening it (e.g. clicking Exec) connects immediately.
Cypress.Commands.add('stubTerminalWebSocket', (urlFragment) => {
  cy.window().then((win) => {
    const OriginalWebSocket = win.WebSocket;
    const { CONNECTING, OPEN, CLOSING, CLOSED } = OriginalWebSocket;
    let fakeWs;
    const stub = cy.stub(win, 'WebSocket').callsFake((url, protocols) => {
      if (url.includes(urlFragment)) {
        fakeWs = {
          binaryType: 'arraybuffer',
          readyState: OPEN,
          onopen: null,
          onmessage: null,
          onclose: null,
          onerror: null,
          send(data) {
            if (!(data instanceof Uint8Array) || data[0] !== 0) return;
            if (new TextDecoder().decode(data.slice(1)) === '\r') {
              const out = new TextEncoder().encode('bin  etc  usr\r\n');
              const frame = new Uint8Array(out.length + 1);
              frame[0] = 1; // stdout channel
              frame.set(out, 1);
              setTimeout(() => fakeWs?.onmessage?.({ data: frame.buffer }), 50);
            }
          },
          close() {
            this.readyState = CLOSED;
            this.onclose?.({ code: 1000, reason: '' });
          },
        };
        // Expose on window so subsequent tests can interact with the mock directly.
        win.__terminalWs = fakeWs;
        setTimeout(() => fakeWs?.onopen?.(), 0);
        return fakeWs;
      }
      return new OriginalWebSocket(url, protocols);
    });
    // Preserve static constants so app checks like `ws.readyState === WebSocket.OPEN` work.
    stub.CONNECTING = CONNECTING;
    stub.OPEN = OPEN;
    stub.CLOSING = CLOSING;
    stub.CLOSED = CLOSED;
  });
});

// Simulate the stdin frame xterm sends when the user presses Enter.
// Kubernetes attach protocol: first byte is the channel (0 = stdin), the
// remaining bytes are the character data. Requires stubTerminalWebSocket first.
Cypress.Commands.add('sendTerminalEnter', () => {
  cy.window().then((win) => {
    const enterByte = new TextEncoder().encode('\r');
    const frame = new Uint8Array(enterByte.length + 1);
    frame[0] = 0; // stdin channel
    frame.set(enterByte, 1);
    win.__terminalWs.send(frame);
  });
});
