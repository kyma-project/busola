export default async function getChatResponse({
  prompt,
  handleSuccess,
  handleError,
}) {
  try {
    const { response } = await fetch(
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
        },
        body: `{"question":"${prompt}"}`,
        method: 'POST',
      },
    ).then(result => result.json());
    handleSuccess(response);
  } catch (error) {
    handleError();
    console.error('Error fetching data:', error);
  }
}
