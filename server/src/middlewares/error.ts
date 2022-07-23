import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({ type: 'error', msg: err.message })
}
