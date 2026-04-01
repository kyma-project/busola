import { getReasonPhrase } from 'http-status-codes';

export class HttpError extends Error {
  constructor(message, status, code, errorDetails) {
    if ([401, 403].includes(status)) {
      super('You are not allowed to perform this operation');
    } else {
      super(message);
    }
    this.code = code;
    this.status = status;
    this.originalMessage = message;
    this.errorDetails = errorDetails;
  }
}

export async function throwHttpError(response) {
  try {
    const parsed = await response.json();
    console.log('Parsed:', parsed);
    return new HttpError(
      parsed.message || 'Unknown error',
      parsed.status,
      parsed.code || response.status,
      parsed.details,
    );
  } catch (e) {
    console.warn('Failed to parse error response as JSON:', e);
    try {
      const text = await response.text();
      return new Error(text);
    } catch (e) {
      console.warn('Failed to parse error response as text:', e);
      const { message, status, statusText } = response;
      const errorMessage =
        message || `${status} ${statusText || getReasonPhrase(status)}`;

      // When response status is 404 and body is empty it means that resource definition is not registered in k8s
      let textStatus = '';
      if (response.status === 404) {
        textStatus = 'Definition not found';
      }
      return new HttpError(errorMessage, textStatus, response.status);
    }
  }
}
