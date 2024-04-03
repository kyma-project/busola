export default async function getPromptSuggestions(
  pageType = 'statefulsets.apps',
  namespace = 'kyma-system',
  nodeName = '',
) {
  try {
    let { results } = await fetch(
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm/init',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,de;q=0.8',
          'content-type': 'application/json',
          'sec-ch-ua':
            '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
        referrer: 'https://ai.kyma.dev.sap/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: `{"page_type":"${pageType}","namespace":"${namespace}","node_name":"${nodeName}"}`,
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
      },
    ).then(result => result.json());
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
