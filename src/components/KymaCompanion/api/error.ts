export class HttpError extends Error {
  statusCode: number;
  title?: string;

  constructor(error: string, statusCode: number) {
    super(error);
    this.statusCode = statusCode;
    this.title = error;
  }
}
