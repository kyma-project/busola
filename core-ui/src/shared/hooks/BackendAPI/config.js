import { getReasonPhrase } from 'http-status-codes';
export const baseUrl = getConfigFn => getConfigFn('backendAddress');

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
    } catch (e) {}
  } // proceed to show more generic error

  const createErrorMessage = (statusCode, statusText) => {
    return `${statusCode} ${statusText || getReasonPhrase(statusCode)}`;
  };

  const errorMessage =
    response.message ||
    createErrorMessage(response.status, response.statusText);

  return new Error(errorMessage);
}
