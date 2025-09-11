import PinoHttp from 'pino-http';
import { v4 as uuid } from 'uuid';
import escape from 'lodash.escape';

function configureLogger() {
  const isDev = process.env.NODE_ENV !== 'production';

  return PinoHttp({
    autoLogging: !!isDev, //to disable the automatic "request completed" and "request errored" logging.
    genReqId: (req) => {
      req.id = uuid();
      return req.id;
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        apiServerAddress: escape(req.headers['x-cluster-url']),
        code: req.code,
        stack: req.stack,
        type: req.type,
        msg: req.msg,
      }),
    },
  });
}

export default function addLogger(handler) {
  const logger = configureLogger();
  return async function wrapper(req, res) {
    logger(req, res);
    handler(req, res);
  };
}
