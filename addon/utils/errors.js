// Copied from ember-fetch addon/utils/errors.ts (converted to JavaScript)
// This file contains utility functions to check the type of HTTP response errors.

/**
 * Checks if the given response represents an unauthorized request error
 */
export function isUnauthorizedResponse(response) {
  return response.status === 401;
}

/**
 * Checks if the given response represents a forbidden request error
 */
export function isForbiddenResponse(response) {
  return response.status === 403;
}

/**
 * Checks if the given response represents an invalid request error
 */
export function isInvalidResponse(response) {
  return response.status === 422;
}

/**
 * Checks if the given response represents a bad request error
 */
export function isBadRequestResponse(response) {
  return response.status === 400;
}

/**
 * Checks if the given response represents a "not found" error
 */
export function isNotFoundResponse(response) {
  return response.status === 404;
}

/**
 * Checks if the given response represents a "gone" error
 */
export function isGoneResponse(response) {
  return response.status === 410;
}

/**
 * Checks if the given error is an "abort" error
 */
export function isAbortError(error) {
  return error.name === "AbortError";
}

/**
 * Checks if the given response represents a conflict error
 */
export function isConflictResponse(response) {
  return response.status === 409;
}

/**
 * Checks if the given response represents a server error
 */
export function isServerErrorResponse(response) {
  return response.status >= 500 && response.status < 600;
}
