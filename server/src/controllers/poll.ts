import { NextFunction, Request, Response } from 'express'

import pool from '../databasePool'

// Calculate the offset and limit from req.query
const getOffset = (req: Request) =>
  req.query.offset ? parseInt(req.query.offset as string, 10) : 0

const getLimit = (req: Request) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5
  return limit > 50 ? 50 : limit
}

export const findPolls = async (req: Request, res: Response) => {
  const offset = getOffset(req)
  const limit = getLimit(req)

  const client = await pool.connect()

  const pollsPromise = client.query(
    `SELECT * FROM poll  ${
      req.params.id ? `WHERE "accountId"=$3` : ''
    } LIMIT $1 OFFSET $2;`,
    [limit, offset, req.params.id]
  )
  const countPromise = client.query(`SELECT COUNT(*) FROM poll`)

  const [polls, count] = await Promise.all([pollsPromise, countPromise])

  res.json({ count: parseInt(count.rows[0].count), polls: polls.rows })

  client.release()
}

export const findPoll = async (req: Request, res: Response) => {
  const client = await pool.connect()

  const response = await client.query(
    `SELECT * FROM poll p JOIN pollOption o ON p.id=o."pollId" JOIN ip i ON p.id=i."pollId" WHERE p.id=$1;`,
    [req.params.id]
  )

  response.rows.length > 0
    ? res.json({ poll: response.rows })
    : res.status(404).json({ msg: 'Poll does not exist' })

  client.release()
}

export const submitPoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect()

  try {
    const response = await client.query(
      `SELECT * FROM poll WHERE "accountId"=$1 AND "pollQuestion"=$2;`,
      [req.body.accountId, req.body.pollQuestion]
    )

    if (response.rows.length > 0) {
      res.status(406).send('Poll already exists')
    } else {
      const insertPollRes = await client.query(
        `INSERT INTO poll("pollQuestion", "accountId") VALUES ($1, $2) RETURNING id;`,
        [req.body.pollQuestion, req.body.accountId]
      )
      const pollId = insertPollRes.rows[0].id

      await Promise.all(
        req.body.pollOptions.map(({ option }: { option: string }) =>
          client.query(
            `INSERT INTO pollOption(option, "pollId") VALUES ($1, $2);`,
            [option, pollId]
          )
        )
      )

      res.json({ msg: 'Poll Submitted' })
    }
  } catch (err) {
    next(err)
  }

  client.release()
}

export const vote = async (req: Request, res: Response) => {
  const client = await pool.connect()

  if (req.body.selection === 'custom') {
    const insertPollOptionPromise = client.query(
      `INSERT INTO pollOption(option, votes, "pollId") VALUES ($1, 1, $2);`,
      [req.body.customSelection, req.body.pollId]
    )

    const insertIpPromise = client.query(
      `INSERT INTO ip(ip, "pollId") VALUES ($1, $2);`,
      [req.clientIp, req.body.pollId]
    )

    await Promise.all([insertPollOptionPromise, insertIpPromise])

    const response = await client.query(
      `SELECT * FROM poll p JOIN pollOption o ON p.id=o."pollId" JOIN ip i ON p.id=i."pollId" WHERE p.id=$1;`,
      [req.body.pollId]
    )

    res.json({ msg: 'Vote Submitted', poll: response.rows })
  }

  client.release()
}
