export default async function getFollowUpQuestions({
  sessionID = '',
  handleFollowUpQuestions,
}) {
  try {
    const url =
      'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/llm/followup';
    const payload = JSON.parse(`{"session_id":"${sessionID}"}`);

    let { results } = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      method: 'POST',
    }).then(result => result.json());
    handleFollowUpQuestions(results);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
