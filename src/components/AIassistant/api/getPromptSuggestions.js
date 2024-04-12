export default async function getPromptSuggestions({
  namespace = '',
  resourceType = '',
  resourceName = '',
}) {
  try {
    const url =
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm/init'; /*'http://127.0.0.1:5000/api/v1/llm/init';*/
    const payload = {
      page_type: 'deployments.apps',
      session_id: 'abcdef12345',
      namespace: namespace,
    }; //`{"resource_type":"${resourceType}","resource_name":"${resourceName}","namespace":"${namespace}"}`

    let { results } = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      method: 'POST',
    }).then(result => result.json());
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
