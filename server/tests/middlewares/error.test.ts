import { Request, Response } from 'express'

import { errorHandler } from '../../src/middlewares/error'
import { buildReq, buildRes, buildNext } from '../utils/generate'

describe('erroHandler', () => {
  it('responds with 500 if there is no status code', () => {
    const req = buildReq()
    const res = buildRes()
    const next = buildNext()
    const message = 'some message'
    const error = new Error(message)

    errorHandler(error, req as Request, res as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      type: 'error',
      msg: error.message,
    })
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  it('responds with statusCode and message for errors with statusCode', () => {
    const req = buildReq()
    const res = buildRes()
    const next = buildNext()
    const message = 'some message'
    const statusCode = 400
    const error = { message, statusCode }

    errorHandler(error, req as Request, res as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(statusCode)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      type: 'error',
      msg: error.message,
    })
    expect(res.json).toHaveBeenCalledTimes(1)
  })
})
