import * as jp from 'jsonpath';

export function getFirstSegment(path) {
  if (!path) {
    return '';
  }

  try {
    return jp.parse(path).find(s => !!s.operation)?.expression.value || '';
  } catch (e) {
    console.warn(e.message);
    return '';
  }
}
