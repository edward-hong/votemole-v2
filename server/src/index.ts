import * as dotenv from 'dotenv'
import express from 'express'
import passport from 'passport'
import session, { SessionOptions } from 'express-session'
import connectPg from 'connect-pg-simple'
import requestIp from 'request-ip'

import pool from './databasePool'
import authRoutes from './routes/authRoutes'
import './auth/setupPassport'

dotenv.config({ path: __dirname + '/.env' })

const { PORT, NODE_ENV, SESSION_SECRET, DATABASE_PASSWORD } = process.env

const store = new (connectPg(session))({
  conString: `postgres://edward:${DATABASE_PASSWORD}@localhost:5432/votemole`,
})

const commonSessionInfo = {
  secret: SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
}

const sessionInfo =
  NODE_ENV === 'production'
    ? ({
        ...commonSessionInfo,
        store,
      } as SessionOptions)
    : ({ ...commonSessionInfo } as SessionOptions)

const app = express()

app.use(requestIp.mw())

app.use(express.json())

app.use(session(sessionInfo))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)

const port = PORT || 5000

app.listen(port, () => console.log(`App started on port: ${port}`))
