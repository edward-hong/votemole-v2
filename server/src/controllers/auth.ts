import passport from 'passport'
import { Request, Response } from 'express'

export const authenticateGoogleController = passport.authenticate('google', {
  scope: ['profile'],
})

export const redirectToHome = (_req: Request, res: Response) => {
  res.redirect('/')
}

export const getUserInfo = (req: Request, res: Response) => {
  res.send(req.user)
}

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    return null
  })
  res.redirect('/')
}
