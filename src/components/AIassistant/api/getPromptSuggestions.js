export default async function getPromptSuggestions({
  pageType = 'statefulsets.apps',
  namespace,
  nodeName = '',
}) {
  try {
    let { results } = await fetch(
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm/init',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
        },
        body: `{"page_type":"${pageType}","namespace":"${namespace}","node_name":"${nodeName}"}`,
        method: 'POST',
      },
    ).then(result => result.json());
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
