export interface HttpError extends Error {
  status?: number;
}

const buildHttpError = (message: string, status: number): HttpError => {
  const error = new Error(message) as HttpError;
  error.status = status;
  return error;
};

export const createBadRequestError = (message = "Bad request") =>
  buildHttpError(message, 400);
export const createForbiddenError = (message = "Forbidden") =>
  buildHttpError(message, 403);
export const createUnauthorizedError = (message = "Unauthorized") =>
  buildHttpError(message, 401);
export const createConflictError = (message = "Conflict") =>
  buildHttpError(message, 409);
