import { Request, Response } from 'express'

import { requireLogin } from '../../src/middlewares/auth'
import { buildReq, buildRes, buildNext } from '../utils/generate'

declare module 'express' {
  interface Request {
    user: boolean
  }
}

describe('requireLogin', () => {
  it('calls next when there is req.user', () => {
    const req = buildReq({ user: true })
    const res = buildRes()
    const next = buildNext()

    requireLogin(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('responds with 401 error when there is no req.user', () => {
    const req = buildReq({ user: false })
    const res = buildRes()
    const next = buildNext()

    requireLogin(req as Request, res as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ error: 'You must log in!' })
    expect(res.json).toHaveBeenCalledTimes(1)
  })
})
