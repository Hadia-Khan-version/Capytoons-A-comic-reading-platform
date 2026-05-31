export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Convenience factories
export const badRequest   = (msg) => new AppError(msg, 400)
export const unauthorized = (msg) => new AppError(msg || 'Unauthorized', 401)
export const forbidden    = (msg) => new AppError(msg || 'Forbidden', 403)
export const notFound     = (msg) => new AppError(msg || 'Not found', 404)
export const conflict     = (msg) => new AppError(msg, 409)