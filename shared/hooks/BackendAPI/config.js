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
  try {
    const parsed = await response.json();
    return new HttpError(
      parsed.message || 'Unknown error',
      parsed.status,
      parsed.code,
    );
  } catch (e) {} // proceed to show more generic error

  return new Error(await response.text());
}
