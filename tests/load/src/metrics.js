const TIMEOUT_RE = /timeout|deadline|Client\.Timeout/i;

function ns2ms(n) {
  return typeof n === 'number' ? n / 1e6 : null;
}

/**
 * Parse a raw Vegeta JSON report into millisecond metrics.
 *
 * Throws if the result is empty, not JSON, missing latencies/requests, or
 * records zero requests — guards against reporting an empty/failed run as a
 * 0-latency success.
 *
 * @param {string} raw raw `vegeta report -type=json` output
 * @returns {{requests:number, rate:{sent:number,achieved:number},
 *   latencyMs:{p50:number,p95:number,p99:number,mean:number,max:number},
 *   statusCodes:object, errors:string[], timeouts:number, success:number}}
 *
 * Note: Vegeta's `rate` is the achieved SENT rate (requests/duration) and
 * `throughput` is the successful-response rate — neither is the configured
 * target. The configured target ("requested") lives in the report metadata.
 */
export function parseMetrics(raw) {
  if (!raw || !String(raw).trim()) {
    throw new Error('parseMetrics: empty Vegeta result');
  }
  let r;
  try {
    r = JSON.parse(raw);
  } catch (e) {
    throw new Error(`parseMetrics: result is not valid JSON: ${e.message}`);
  }
  if (!r.latencies || typeof r.requests !== 'number') {
    throw new Error('parseMetrics: result missing latencies/requests');
  }
  if (r.requests === 0) {
    throw new Error('parseMetrics: zero requests recorded');
  }

  const errors = Array.isArray(r.errors) ? r.errors : [];
  const timeouts = errors.filter((e) => TIMEOUT_RE.test(e)).length;

  return {
    requests: r.requests,
    rate: { sent: r.rate, achieved: r.throughput },
    latencyMs: {
      p50: ns2ms(r.latencies['50th']),
      p95: ns2ms(r.latencies['95th']),
      p99: ns2ms(r.latencies['99th']),
      mean: ns2ms(r.latencies.mean),
      max: ns2ms(r.latencies.max),
    },
    statusCodes: r.status_codes || {},
    errors,
    timeouts,
    success: r.success,
  };
}
