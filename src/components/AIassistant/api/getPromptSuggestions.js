import { extractApiGroup } from 'resources/Roles/helpers';

export default async function getPromptSuggestions({
  namespace = '',
  resourceType = '',
  groupVersion = '',
  resourceName = '',
  sessionID = '',
}) {
  try {
    const url =
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm/init';
    const apiGroup = extractApiGroup(groupVersion);
    const payload = JSON.parse(
      `{"resource_type":"${resourceType.toLowerCase()}${
        apiGroup.length ? `.${apiGroup}` : ''
      }","resource_name":"${resourceName}","namespace":"${namespace}","session_id":"${sessionID}"}`,
    );

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
