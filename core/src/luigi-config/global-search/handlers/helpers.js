import didYouMean from 'didyoumean';

export function getSuggestion(phrase, itemList) {
  const suggestion = didYouMean(phrase, itemList);
  if (suggestion !== phrase) {
    return suggestion;
  }
  return null;
}

export function getApiPath(viewUrl) {
  try {
    return new URL(viewUrl).searchParams.get('resourceApiPath');
  } catch (e) {
    return null;
  }
}
