import * as dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config({ path: __dirname + '/.env' })

const pool = new Pool({
  user: 'edward',
  host: 'localhost',
  database: 'votemole',
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
})

export default pool
