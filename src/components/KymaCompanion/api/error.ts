export class HttpError extends Error {
  statusCode: number;
  title?: string;

  constructor(error: string, statusCode: number) {
    super(error);
    this.statusCode = statusCode;
    this.title = error;
  }
}

export enum HTTPStatus {
  RATE_LIMIT_CODE = 429,
}
