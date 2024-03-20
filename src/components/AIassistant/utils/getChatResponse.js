function delay() {
  return new Promise(resolve => setTimeout(resolve, 3000));
}

export default async function getChatResponse(
  prompt,
  handleSuccess,
  handleError,
) {
  try {
    if (prompt === 'Throw an error') {
      await delay();
      throw new Error('This is a custom error message.');
    }

    const { response } = await fetch(
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          pragma: 'no-cache',
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
        body: `{"question":"${prompt}"}`,
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
      },
    ).then(result => result.json());
    handleSuccess(response);
    return true;
  } catch (error) {
    handleError();
    console.error('Error fetching data:', error);
    return false;
  }
}
