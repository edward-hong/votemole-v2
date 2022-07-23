import express from 'express'

import {
  authenticateGoogleController,
  redirectToHome,
  getUserInfo,
  logout,
} from '../controllers/auth'
import { authenticateGoogleMiddleware } from '../middlewares/auth'

const auth = express.Router()

// Google OAuth routes
auth.get('/google', authenticateGoogleController)

auth.get('/google/callback', authenticateGoogleMiddleware, redirectToHome)

// Check if logged in
auth.get('/current_user', getUserInfo)

// Logout
auth.get('/logout', logout)

export default auth
