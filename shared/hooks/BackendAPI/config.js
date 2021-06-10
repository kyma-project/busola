export const baseUrl = getConfigFn => getConfigFn('backendApiUrl');

export class HttpError extends Error {
  constructor(message, statusCode, code) {
    if ([401, 403].includes(statusCode)) {
      super('You are not allowed to perform this operation');
    } else {
      super(message);
    }
    this.code = code;
    this.statusCode = statusCode;
    this.originalMessage = message;
  }
}

export async function throwHttpError(response) {
  console.log('response:', response);
  try {
    const parsed = await response.json();
    console.log('parsed:', parsed);
    return new HttpError(
      parsed.message || 'Unknown error',
      parsed.status,
      parsed.code,
    );
  } catch (e) {
    console.log('response.json fail!');
    try {
      const text = await response.text();
      console.log('text', text);
      return new Error(text);
    } catch (e) {
      console.log('response.text fail!');
    }
  } // proceed to show more generic error

  return new Error(response.message || response.statusText || response);
}
