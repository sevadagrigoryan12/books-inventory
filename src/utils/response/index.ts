import { Request, Response } from 'express'; // eslint-disable-line import/no-unresolved

export const createSuccessResponse = (response: Response, code = 200, data = {}) =>
  response.status(code).json({
    success: true,
    data,
  });

export const createFailResponse = (
  _request: Request,
  response: Response,
  code = 400,
  message = 'Bad Request',
  data = {},
  error = {},
) => {
  console.error(message, { err: error });

  response.status(code).json({
    success: false,
    message,
    data,
    error,
  });
};

export const createAccessDeniedResponse = (
  _request: Request,
  response: Response,
  error = {},
  message = 'Access Denied',
  code = 403,
) => {
  console.error(message, { err: error });

  response.status(code).json({
    success: false,
    message,
    error,
  });
};

export const createErrorResponse = (
  _request: Request,
  response: Response,
  code = 500,
  message = 'Internal Server Error',
  error = {},
) => {
  console.error(message, { err: error });

  response.status(code).json({
    success: false,
    message,
    error,
  });
};

export const createResponse = (
  _request: Request,
  response: Response,
  code: number,
  message: string,
  data: Record<string, unknown>,
) => {
  if (code >= 200 && code < 300) {
    createSuccessResponse(response, code, data);
  } else if (code === 403) {
    createAccessDeniedResponse(_request, response);
  } else if (code >= 400 && code < 500) {
    createFailResponse(_request, response, code, message, data);
  } else {
    createErrorResponse(_request, response, code, message, data);
  }
};
