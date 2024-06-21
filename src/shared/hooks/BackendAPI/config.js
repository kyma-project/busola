import { getReasonPhrase } from 'http-status-codes';

export class HttpError extends Error {
  constructor(message, status, code) {
    if ([401, 403].includes(status)) {
      super('You are not allowed to perform this operation');
    } else {
      super(message);
    }
    this.code = code;
    this.status = status;
    this.originalMessage = message;
  }
}

export async function throwHttpError(response) {
  try {
    const parsed = await response.json();
    return new HttpError(
      parsed.message || 'Unknown error',
      parsed.status,
      parsed.code,
    );
  } catch (e) {
    try {
      const text = await response.text();
      return new Error(text);
    } catch (e) {
      const { message, status, statusText } = response;
      const errorMessage =
        message || `${status} ${statusText || getReasonPhrase(status)}`;

      // When response status is 404 and boyd is empty it means that resoruce definition is not registered in k8s
      let textStatus = '';
      if (response.status === 404) {
        textStatus = 'Definition not found';
      }
      return new HttpError(errorMessage, textStatus, response.status);
    }
  }
}
