/* global process */
import escape from 'lodash.escape';

/**
 * Middleware to log requests that take longer than the specified threshold.
 * @param {Object} logger - The Pino logger instance (or similar).
 * @param {number} thresholdMs - Time in milliseconds to consider a request "slow". Default 4000ms.
 */
export const slowRequestLogger = (logger, thresholdMs = 4000) => {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    // Hook into the response 'finish' event (fires when response has been sent completely)
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      // Convert nanoseconds to milliseconds
      const durationMs = Number(end - start) / 1e6;

      if (durationMs > thresholdMs) {
        const url = req.originalUrl || req.url;

        logger.warn({
          msg: `Slow request detected: ${req.method} ${url} took ${durationMs.toFixed(2)}ms`,
          reqId: req.id,
          method: req.method,
          url: escape(url),
          duration: parseFloat(durationMs.toFixed(2)),
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
};
