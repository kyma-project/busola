import didYouMean from 'didyoumean';
import { prettifyNameSingular, prettifyNamePlural } from 'react-shared';

export function getSuggestion(phrase, itemList) {
  const suggestion = didYouMean(phrase, itemList);
  if (suggestion !== phrase) {
    return suggestion;
  }
  return null;
}

export function getApiPath(viewUrl) {
  try {
    const url = new URL(viewUrl);
    return url.searchParams.get('resourceApiPath');
  } catch (e) {
    return null;
  }
}

export function formatTypePlural(viewUrl) {
  const { pathname } = new URL(viewUrl);
  const resourceType = pathname.substring(pathname.lastIndexOf('/') + 1);
  return prettifyNamePlural(null, resourceType);
}

export function formatTypeSingular(viewUrl) {
  const { pathname } = new URL(viewUrl);
  const resourceType = pathname.substring(pathname.lastIndexOf('/') + 1);
  return prettifyNameSingular(null, resourceType);
}

// assume first item is full name
export function toFullName(resourceType, resources) {
  return resources.find(r => r.includes(resourceType))?.[0] || resourceType;
}
