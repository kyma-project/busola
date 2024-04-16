export default async function getChatResponse({
  prompt,
  handleSuccess,
  handleError,
  sessionID,
}) {
  const url =
    'https://api-backend.c-5cb6076.stage.kyma.ondemand.com/api/v1/chat';
  const payload = { question: prompt, session_id: sessionID };

  fetch(url, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    method: 'POST',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      readChunk(reader, decoder, handleSuccess, handleError);
    })
    .catch(error => {
      handleError();
      console.error('Error fetching data:', error);
    });
}

function readChunk(reader, decoder, handleSuccess, handleError) {
  reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        return;
      }
      const chunk = JSON.parse(decoder.decode(value, { stream: true }));
      handleSuccess(chunk);
      readChunk(reader, decoder, handleSuccess, handleError);
    })
    .catch(error => {
      handleError();
      console.error('Error reading stream:', error);
    });
}
