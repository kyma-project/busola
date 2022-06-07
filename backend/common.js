const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;
import { handleDockerDesktopSubsitution } from './docker-desktop-substitution';
import { filters } from './request-filters';

const logger = require('pino-http')({
  autoLogging: process.env.NODE_ENV !== 'production', //to disable the automatic "request completed" and "request errored" logging.
  genReqId: req => {
    req.id = uuid();
    return req.id;
  },
  serializers: {
    req: req => ({
      id: req.id,
      method: req.method,
      url: req.url,
      cluster_url: req.headers['x-cluster-url'],
      code: req.code,
      stack: req.stack,
      type: req.type,
      msg: req.msg,
    }),
  },
});

// https://github.tools.sap/sgs/SAP-Global-Trust-List/blob/master/approved.pem
const certs = fs.readFileSync('certs.pem', 'utf8');

const isHeaderDefined = headerValue => {
  return headerValue !== undefined && headerValue !== 'undefined';
};

const decodeHeaderToBuffer = headerValue => {
  return isHeaderDefined(headerValue)
    ? Buffer.from(headerValue, 'base64')
    : null;
};

// for some mysterious reason, request for node metrics
// comes with "Connection: Upgrade" header, causing
// "invalid upgrade response: status code 200" error
const workaroundForNodeMetrics = req => {
  if (req.originalUrl.includes('apis/metrics.k8s.io/v1beta1/nodes')) {
    req.headers['connection'] = 'close';
  }
};

export const handleRequest = async (req, res) => {
  logger(req, res);
  let headersData;
  try {
    headersData = extractHeadersData(req);
  } catch (e) {
    req.log.error('Headers error:' + e.message);
    res.status(400).send('Headers are missing or in a wrong format.');
    return;
  }

  try {
    filters.forEach(filter => filter(req, headersData));
  } catch (e) {
    req.log.error('Filters rejected the request: ' + e.message);
    res.status(400).send('Request ID: ' + req.id);
    return;
  }

  const { targetApiServer, ca, cert, key, authorization } = headersData;

  const headers = authorization
    ? { ...req.headers, authorization }
    : req.headers;

  const options = {
    hostname: targetApiServer.hostname,
    path: req.originalUrl.replace(/^\/backend/, ''),
    headers,
    body: req.body,
    method: req.method,
    port: targetApiServer.port || 443,
    ca,
    cert,
    key,
  };
  workaroundForNodeMetrics(req);

  const MD5 = function(d) {
    var r = M(V(Y(X(d), 8 * d.length)));
    return r.toLowerCase();
  };
  function M(d) {
    for (var _, m = '0123456789ABCDEF', f = '', r = 0; r < d.length; r++)
      (_ = d.charCodeAt(r)), (f += m.charAt((_ >>> 4) & 15) + m.charAt(15 & _));
    return f;
  }
  function X(d) {
    for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
    for (m = 0; m < 8 * d.length; m += 8)
      _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
    return _;
  }
  function V(d) {
    for (var _ = '', m = 0; m < 32 * d.length; m += 8)
      _ += String.fromCharCode((d[m >> 5] >>> m % 32) & 255);
    return _;
  }
  function Y(d, _) {
    (d[_ >> 5] |= 128 << _ % 32), (d[14 + (((_ + 64) >>> 9) << 4)] = _);
    for (
      var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0;
      n < d.length;
      n += 16
    ) {
      var h = m,
        t = f,
        g = r,
        e = i;
      (f = md5_ii(
        (f = md5_ii(
          (f = md5_ii(
            (f = md5_ii(
              (f = md5_hh(
                (f = md5_hh(
                  (f = md5_hh(
                    (f = md5_hh(
                      (f = md5_gg(
                        (f = md5_gg(
                          (f = md5_gg(
                            (f = md5_gg(
                              (f = md5_ff(
                                (f = md5_ff(
                                  (f = md5_ff(
                                    (f = md5_ff(
                                      f,
                                      (r = md5_ff(
                                        r,
                                        (i = md5_ff(
                                          i,
                                          (m = md5_ff(
                                            m,
                                            f,
                                            r,
                                            i,
                                            d[n + 0],
                                            7,
                                            -680876936,
                                          )),
                                          f,
                                          r,
                                          d[n + 1],
                                          12,
                                          -389564586,
                                        )),
                                        m,
                                        f,
                                        d[n + 2],
                                        17,
                                        606105819,
                                      )),
                                      i,
                                      m,
                                      d[n + 3],
                                      22,
                                      -1044525330,
                                    )),
                                    (r = md5_ff(
                                      r,
                                      (i = md5_ff(
                                        i,
                                        (m = md5_ff(
                                          m,
                                          f,
                                          r,
                                          i,
                                          d[n + 4],
                                          7,
                                          -176418897,
                                        )),
                                        f,
                                        r,
                                        d[n + 5],
                                        12,
                                        1200080426,
                                      )),
                                      m,
                                      f,
                                      d[n + 6],
                                      17,
                                      -1473231341,
                                    )),
                                    i,
                                    m,
                                    d[n + 7],
                                    22,
                                    -45705983,
                                  )),
                                  (r = md5_ff(
                                    r,
                                    (i = md5_ff(
                                      i,
                                      (m = md5_ff(
                                        m,
                                        f,
                                        r,
                                        i,
                                        d[n + 8],
                                        7,
                                        1770035416,
                                      )),
                                      f,
                                      r,
                                      d[n + 9],
                                      12,
                                      -1958414417,
                                    )),
                                    m,
                                    f,
                                    d[n + 10],
                                    17,
                                    -42063,
                                  )),
                                  i,
                                  m,
                                  d[n + 11],
                                  22,
                                  -1990404162,
                                )),
                                (r = md5_ff(
                                  r,
                                  (i = md5_ff(
                                    i,
                                    (m = md5_ff(
                                      m,
                                      f,
                                      r,
                                      i,
                                      d[n + 12],
                                      7,
                                      1804603682,
                                    )),
                                    f,
                                    r,
                                    d[n + 13],
                                    12,
                                    -40341101,
                                  )),
                                  m,
                                  f,
                                  d[n + 14],
                                  17,
                                  -1502002290,
                                )),
                                i,
                                m,
                                d[n + 15],
                                22,
                                1236535329,
                              )),
                              (r = md5_gg(
                                r,
                                (i = md5_gg(
                                  i,
                                  (m = md5_gg(
                                    m,
                                    f,
                                    r,
                                    i,
                                    d[n + 1],
                                    5,
                                    -165796510,
                                  )),
                                  f,
                                  r,
                                  d[n + 6],
                                  9,
                                  -1069501632,
                                )),
                                m,
                                f,
                                d[n + 11],
                                14,
                                643717713,
                              )),
                              i,
                              m,
                              d[n + 0],
                              20,
                              -373897302,
                            )),
                            (r = md5_gg(
                              r,
                              (i = md5_gg(
                                i,
                                (m = md5_gg(
                                  m,
                                  f,
                                  r,
                                  i,
                                  d[n + 5],
                                  5,
                                  -701558691,
                                )),
                                f,
                                r,
                                d[n + 10],
                                9,
                                38016083,
                              )),
                              m,
                              f,
                              d[n + 15],
                              14,
                              -660478335,
                            )),
                            i,
                            m,
                            d[n + 4],
                            20,
                            -405537848,
                          )),
                          (r = md5_gg(
                            r,
                            (i = md5_gg(
                              i,
                              (m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438)),
                              f,
                              r,
                              d[n + 14],
                              9,
                              -1019803690,
                            )),
                            m,
                            f,
                            d[n + 3],
                            14,
                            -187363961,
                          )),
                          i,
                          m,
                          d[n + 8],
                          20,
                          1163531501,
                        )),
                        (r = md5_gg(
                          r,
                          (i = md5_gg(
                            i,
                            (m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467)),
                            f,
                            r,
                            d[n + 2],
                            9,
                            -51403784,
                          )),
                          m,
                          f,
                          d[n + 7],
                          14,
                          1735328473,
                        )),
                        i,
                        m,
                        d[n + 12],
                        20,
                        -1926607734,
                      )),
                      (r = md5_hh(
                        r,
                        (i = md5_hh(
                          i,
                          (m = md5_hh(m, f, r, i, d[n + 5], 4, -378558)),
                          f,
                          r,
                          d[n + 8],
                          11,
                          -2022574463,
                        )),
                        m,
                        f,
                        d[n + 11],
                        16,
                        1839030562,
                      )),
                      i,
                      m,
                      d[n + 14],
                      23,
                      -35309556,
                    )),
                    (r = md5_hh(
                      r,
                      (i = md5_hh(
                        i,
                        (m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060)),
                        f,
                        r,
                        d[n + 4],
                        11,
                        1272893353,
                      )),
                      m,
                      f,
                      d[n + 7],
                      16,
                      -155497632,
                    )),
                    i,
                    m,
                    d[n + 10],
                    23,
                    -1094730640,
                  )),
                  (r = md5_hh(
                    r,
                    (i = md5_hh(
                      i,
                      (m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174)),
                      f,
                      r,
                      d[n + 0],
                      11,
                      -358537222,
                    )),
                    m,
                    f,
                    d[n + 3],
                    16,
                    -722521979,
                  )),
                  i,
                  m,
                  d[n + 6],
                  23,
                  76029189,
                )),
                (r = md5_hh(
                  r,
                  (i = md5_hh(
                    i,
                    (m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487)),
                    f,
                    r,
                    d[n + 12],
                    11,
                    -421815835,
                  )),
                  m,
                  f,
                  d[n + 15],
                  16,
                  530742520,
                )),
                i,
                m,
                d[n + 2],
                23,
                -995338651,
              )),
              (r = md5_ii(
                r,
                (i = md5_ii(
                  i,
                  (m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844)),
                  f,
                  r,
                  d[n + 7],
                  10,
                  1126891415,
                )),
                m,
                f,
                d[n + 14],
                15,
                -1416354905,
              )),
              i,
              m,
              d[n + 5],
              21,
              -57434055,
            )),
            (r = md5_ii(
              r,
              (i = md5_ii(
                i,
                (m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571)),
                f,
                r,
                d[n + 3],
                10,
                -1894986606,
              )),
              m,
              f,
              d[n + 10],
              15,
              -1051523,
            )),
            i,
            m,
            d[n + 1],
            21,
            -2054922799,
          )),
          (r = md5_ii(
            r,
            (i = md5_ii(
              i,
              (m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359)),
              f,
              r,
              d[n + 15],
              10,
              -30611744,
            )),
            m,
            f,
            d[n + 6],
            15,
            -1560198380,
          )),
          i,
          m,
          d[n + 13],
          21,
          1309151649,
        )),
        (r = md5_ii(
          r,
          (i = md5_ii(
            i,
            (m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070)),
            f,
            r,
            d[n + 11],
            10,
            -1120210379,
          )),
          m,
          f,
          d[n + 2],
          15,
          718787259,
        )),
        i,
        m,
        d[n + 9],
        21,
        -343485551,
      )),
        (m = safe_add(m, h)),
        (f = safe_add(f, t)),
        (r = safe_add(r, g)),
        (i = safe_add(i, e));
    }
    return Array(m, f, r, i);
  }
  function md5_cmn(d, _, m, f, r, i) {
    return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
  }
  function md5_ff(d, _, m, f, r, i, n) {
    return md5_cmn((_ & m) | (~_ & f), d, _, r, i, n);
  }
  function md5_gg(d, _, m, f, r, i, n) {
    return md5_cmn((_ & f) | (m & ~f), d, _, r, i, n);
  }
  function md5_hh(d, _, m, f, r, i, n) {
    return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
  }
  function md5_ii(d, _, m, f, r, i, n) {
    return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
  }
  function safe_add(d, _) {
    var m = (65535 & d) + (65535 & _);
    return (((d >> 16) + (_ >> 16) + (m >> 16)) << 16) | (65535 & m);
  }
  function bit_rol(d, _) {
    return (d << _) | (d >>> (32 - _));
  }

  const k8sRequest = https.request(options, function(k8sResponse) {
    if (
      k8sResponse.headers &&
      (k8sResponse.headers['Content-Type']?.includes('\\') ||
        k8sResponse.headers['content-encoding']?.includes('\\'))
    )
      return throwInternalServerError(
        'Response headers are potentially dangerous',
      );

    res.writeHead(k8sResponse.statusCode, {
      'Content-Type': k8sResponse.headers['Content-Type'] || 'text/json',
      'Content-Encoding': k8sResponse.headers['content-encoding'] || '',
    });

    const hashedName = MD5(req.originalUrl);
    const fullPath = path.join(__dirname, '..', 'mocks', `${hashedName}.json`);

    const isSaved = fs.existsSync(fullPath);
    console.log(111111111111, req.originalUrl);
    console.log(222222222222, isSaved, fullPath);
    if (isSaved) {
      const rStream = fs.createReadStream(fullPath);
      rStream.pipe(res);
    } else {
      const wStream = fs.createWriteStream(fullPath);
      k8sResponse.pipe(wStream);
      k8sResponse.pipe(res);
    }
  });
  k8sRequest.on('error', throwInternalServerError); // no need to sanitize the error here as the http.request() will never throw a vulnerable error
  k8sRequest.end(Buffer.isBuffer(req.body) ? req.body : undefined);
  req.pipe(k8sRequest);

  function throwInternalServerError(originalError) {
    req.log.warn(originalError);
    res.status(502).send('Request ID: ' + req.id);
  }
};

export const serveStaticApp = (app, requestPath, directoryPath) => {
  app.use(requestPath, express.static(path.join(__dirname, directoryPath)));
  app.get(requestPath + '*', (_, res) =>
    res.sendFile(path.join(__dirname + directoryPath + '/index.html')),
  );
};

export const serveMonaco = app => {
  app.use('/vs', express.static(path.join(__dirname, '/core-ui/vs')));
};

function extractHeadersData(req) {
  const urlHeader = 'x-cluster-url';
  const caHeader = 'x-cluster-certificate-authority-data';
  const clientCAHeader = 'x-client-certificate-data';
  const clientKeyDataHeader = 'x-client-key-data';
  const authorizationHeader = 'x-k8s-authorization';

  const targetApiServer = handleDockerDesktopSubsitution(
    new URL(req.headers[urlHeader]),
  );
  const ca = decodeHeaderToBuffer(req.headers[caHeader]) || certs;
  const cert = decodeHeaderToBuffer(req.headers[clientCAHeader]);
  const key = decodeHeaderToBuffer(req.headers[clientKeyDataHeader]);
  const authorization = req.headers[authorizationHeader];

  delete req.headers[urlHeader];
  delete req.headers[caHeader];
  delete req.headers[clientCAHeader];
  delete req.headers[clientKeyDataHeader];
  delete req.headers[authorizationHeader];

  delete req.headers.host; // remove host in order not to confuse APIServer

  return { targetApiServer, ca, cert, key, authorization };
}
