import { ErrResponse } from '../components/Chat/types';
import { TFunction } from 'i18next';

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
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNPROCESSABLE_ENTITY = 422,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  RATE_LIMIT_CODE = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export const getErrorMessageAndTitle = (
  errResponse: ErrResponse,
  t: TFunction,
): { title?: string; message: string } => {
  switch (errResponse.statusCode) {
    case HTTPStatus.UNAUTHORIZED:
    case HTTPStatus.FORBIDDEN:
      return {
        title: t('kyma-companion.error.unauthorized-title'),
        message: t('kyma-companion.error.unauthorized-message'),
      };
    case HTTPStatus.NOT_FOUND:
      return {
        title: t('kyma-companion.error.not_found-title'),
        message: t('kyma-companion.error.not_found-message'),
      };
    case HTTPStatus.BAD_REQUEST:
      return {
        title: t('kyma-companion.error.bad_request-title'),
        message: t('kyma-companion.error.bad_request-message'),
      };
    case HTTPStatus.UNPROCESSABLE_ENTITY:
      return {
        title: t('kyma-companion.error.unprocessable_entity-title'),
        message: t('kyma-companion.error.unprocessable_entity-message'),
      };
    case HTTPStatus.METHOD_NOT_ALLOWED:
      return {
        title: t('kyma-companion.error.method_not_allowed-title'),
        message: t('kyma-companion.error.method_not_allowed-message'),
      };
    case HTTPStatus.REQUEST_TIMEOUT:
      return {
        title: t('kyma-companion.error.request_timeout-title'),
        message: t('kyma-companion.error.request_timeout-message'),
      };
    case HTTPStatus.RATE_LIMIT_CODE:
      return {
        title: t('kyma-companion.error.rate_limit_code-title'),
        message: t('kyma-companion.error.rate_limit_code-message'),
      };
    case HTTPStatus.INTERNAL_SERVER_ERROR:
      return {
        title: t('kyma-companion.error.title'),
        message: t('kyma-companion.error.internal_server_error-message'),
      };
    default:
      return { title: errResponse.title, message: errResponse.message };
  }
};
