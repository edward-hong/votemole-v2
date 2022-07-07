import * as dotenv from 'dotenv'
import path from 'path'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import pool from '../databasePool'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user: string, done) => {
  done(null, user)
})

// Callback used to either log in existing user
// or create new user

const login = async (
  _accessToken: any,
  _refreshToken: any,
  profile: { id: any },
  done: any
) => {
  const client = await pool.connect()

  const response = await client.query(
    `SELECT * FROM account WHERE "profileId"=$1;`,
    [profile.id]
  )

  if (response.rows.length > 0) {
    done(null, response.rows[0])
  } else {
    await client.query(`INSERT INTO account("profileId") VALUES ($1)`, [
      profile.id,
    ])
  }

  await pool.end()
}

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/auth/google/callback',
      proxy: true,
    },
    login
  )
)
