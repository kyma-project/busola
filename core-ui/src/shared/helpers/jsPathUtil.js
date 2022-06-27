import * as jp from 'jsonpath';

export function getFirstSegment(path) {
  try {
    return jp.parse(path).find(s => !!s.operation)?.expression.value || '';
  } catch (e) {
    console.warn(e);
    return '';
  }
}
