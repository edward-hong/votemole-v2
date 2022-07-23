import passport from 'passport'
import { Request, Response, NextFunction } from 'express'

export const authenticateGoogleMiddleware = passport.authenticate('google')

export const requireLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).send({ error: 'You must log in!' })
  }
  next()
}
