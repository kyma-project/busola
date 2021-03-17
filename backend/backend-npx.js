#!/usr/bin/env node
(() => {
  'use strict';
  var e = {
      378: (e, t, r) => {
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.default = void 0);
        const n = r(622),
          o = r(901),
          s = r(127);
        function i(e) {
          return (...t) => {
            e(...t);
          };
        }
        var u = {
          setupEnv: i(function() {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
          }),
          setupRoutes: i(function(e, t) {
            e.use('/core-ui', s.static(n.join(__dirname, 'core-ui'))),
              e.get('/core-ui/*', (e, t) =>
                t.sendFile(n.join(__dirname + '/core-ui/index.html')),
              ),
              e.use('/backend', t),
              e.use('/', s.static(n.join(__dirname, 'core'))),
              e.get('/*', (e, t) =>
                t.sendFile(n.join(__dirname + '/core/index.html')),
              );
          }),
          openBrowser: i(function(e) {
            o(`http://localhost:${e}/`);
          }),
          adjustRequestOptions: i(function(e, t) {
            t.applyToRequest(e);
          }),
          isNpxEnv: function() {
            return !0;
          },
        };
        t.default = u;
      },
      122: (e, t, r) => {
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.initializeApp = async function(e, t) {
            e.set('token_cache', []);
            try {
              const r = t.getCurrentCluster().caFile;
              if (!r) throw new Error('No certificate provided');
              const s = o.default.readFileSync(r, 'utf8'),
                i = new n.default.Agent({ ca: s });
              e.set('https_agent', i),
                console.log('✔️  Setting up https HTTPS agent');
            } catch (e) {
              console.error(
                '❌ Setting up https HTTPS agent ended with error; an insecure connection will be used.',
              );
            }
          });
        var n = s(r(211)),
          o = s(r(747));
        function s(e) {
          return e && e.__esModule ? e : { default: e };
        }
      },
      770: (e, t, r) => {
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.initializeKubeconfig = function() {
            const e = process.env.KUBECONFIG,
              t = process.env.REACT_APP_domain,
              r = new n.KubeConfig();
            if (e) r.loadFromFile(e);
            else if (t) {
              const e = { name: 'my-server', server: `http://api.${t}` },
                n = { name: 'my-context', cluster: e.name };
              r.loadFromOptions({
                clusters: [e],
                contexts: [n],
                currentContext: n.name,
              });
            } else r.loadFromCluster();
            return r;
          });
        var n = r(779);
      },
      960: (e, t) => {
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.requestLogger = function(e) {
            var t = e.request;
            e.request = function(e, r) {
              return (
                console.log('Outgoing HTTP request with options', e), t(e, r)
              );
            };
          });
      },
      779: e => {
        e.exports = require('@kubernetes/client-node');
      },
      479: e => {
        e.exports = require('cors');
      },
      127: e => {
        e.exports = require('express');
      },
      747: e => {
        e.exports = require('fs');
      },
      605: e => {
        e.exports = require('http');
      },
      211: e => {
        e.exports = require('https');
      },
      901: e => {
        e.exports = require('open');
      },
      622: e => {
        e.exports = require('path');
      },
    },
    t = {};
  function r(n) {
    if (t[n]) return t[n].exports;
    var o = (t[n] = { exports: {} });
    return e[n](o, o.exports, r), o.exports;
  }
  (() => {
    var e,
      t = (e = r(378)) && e.__esModule ? e : { default: e },
      n = r(770),
      o = r(122);
    r(960);
    const s = r(127),
      i = (r(479), r(605)),
      u = r(211);
    t.default.setupEnv();
    const a = s();
    a.use(s.raw({ type: '*/*' }));
    const c = i.createServer(a),
      d = (0, n.initializeKubeconfig)(),
      l = new URL(d.getCurrentCluster().server),
      p = process.env.PORT || 3001,
      f = process.env.ADDRESS || 'localhost';
    console.log(`K8s server used: ${l}`),
      (0, o.initializeApp)(a, d)
        .then(e => {
          const r = a.get('https_agent'),
            n = h(r);
          t.default.isNpxEnv() ? t.default.setupRoutes(a, n) : a.use(n),
            c.listen(p, f, () => {
              console.log(`Busola backend server started @ ${p}!`),
                t.default.openBrowser(p);
            });
        })
        .catch(e => {
          console.error('PANIC!', e), process.exit(1);
        });
    const h = e => async (r, n) => {
      delete r.headers.host;
      const o =
        r.headers['x-api-url'] && 'undefined' !== r.headers['x-api-url']
          ? r.headers['x-api-url']
          : l.hostname;
      delete r.headers['x-api-url'];
      const s = {
        hostname: o,
        path: r.originalUrl.replace(/^\/backend/, ''),
        headers: r.headers,
        body: r.body,
        agent: e,
        method: r.method,
        port: l.port || 443,
      };
      t.default.adjustRequestOptions(s, d);
      const i = u
        .request(s, function(e) {
          n.writeHead(e.statusCode, {
            'Content-Type': e.headers['Content-Type'] || 'text/json',
            'Content-Encoding': e.headers['content-encoding'] || '',
          }),
            e.pipe(n);
        })
        .on('error', function(e) {
          console.error('Internal server error thrown', e),
            (n.statusMessage = 'Internal server error'),
            (n.statusCode = 500),
            n.end(Buffer.from(JSON.stringify({ message: e })));
        });
      i.end(Buffer.isBuffer(r.body) ? r.body : void 0), r.pipe(i);
    };
  })();
})();
