import * as dotenv from 'dotenv'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { createClient } from 'redis'

import pool from '../databasePool'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const redisClient = createClient({ url: process.env.REDIS_URL as string })

const getOffset = (req: Request) =>
  req.query.offset ? parseInt(req.query.offset as string, 10) : 0

const getLimit = (req: Request) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5
  return limit > 50 ? 50 : limit
}

export const findPolls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offset = getOffset(req)
  const limit = getLimit(req)

  const pgClient = await pool.connect()
  await redisClient.connect()

  const redisKey = req.params.id ? `userPolls:${req.params.id}` : `allPolls`

  const getCountFromRedis = redisClient.hGet(redisKey, 'polls')
  const getPollsFromRedis = redisClient.hGet(redisKey, 'count')

  try {
    const [polls, count] = await Promise.all([
      getCountFromRedis,
      getPollsFromRedis,
    ])

    if (typeof polls === 'string') {
      res.json({
        count: parseInt(count as string, 10),
        polls: JSON.parse(polls),
      })
    } else {
      const response = req.params.id
        ? await pgClient.query(
            `SELECT * FROM poll WHERE "accountId"=$3 LIMIT $1 OFFSET $2;`,
            [limit, offset, req.params.id]
          )
        : await pgClient.query('SELECT * FROM poll LIMIT $1 OFFSET $2;', [
            limit,
            offset,
          ])

      await redisClient.hSet(redisKey, 'count', response.rowCount)
      await redisClient.hSet(redisKey, 'polls', JSON.stringify(response.rows))

      res.json({ count: response.rowCount, polls: response.rows })
    }
  } catch (err) {
    next(err)
  }

  pgClient.release()
  await redisClient.quit()
}

export const findPoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pgClient = await pool.connect()

  try {
    const response = await pgClient.query(
      `SELECT * FROM poll p JOIN pollOption o ON p.id=o."pollId" WHERE p.id=$1;`,
      [req.params.id]
    )

    response.rowCount > 0
      ? res.json({ poll: response.rows })
      : res.status(404).json({ msg: 'Poll does not exist' })
  } catch (err) {
    next(err)
  }

  pgClient.release()
}

export const submitPoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pgClient = await pool.connect()
  await redisClient.connect()

  try {
    const response = await pgClient.query(
      `SELECT * FROM poll WHERE "accountId"=$1 AND "pollQuestion"=$2;`,
      [req.body.accountId, req.body.pollQuestion]
    )

    if (response.rowCount > 0) {
      res.status(406).send('Poll already exists')
    } else {
      await redisClient.flushAll()

      const insertPollRes = await pgClient.query(
        `INSERT INTO poll("pollQuestion", "accountId") VALUES ($1, $2) RETURNING id;`,
        [req.body.pollQuestion, req.body.accountId]
      )
      const pollId = insertPollRes.rows[0].id

      await Promise.all(
        req.body.pollOptions.map(({ option }: { option: string }) =>
          pgClient.query(
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

  pgClient.release()
  await redisClient.quit()
}

export const vote = async (req: Request, res: Response, next: NextFunction) => {
  const pgClient = await pool.connect()

  try {
    const ipResponse = await pgClient.query(
      `SELECT * FROM ip WHERE "pollId"=$1 AND ip.ip=$2;`,
      [req.body.pollId, req.clientIp]
    )

    if (ipResponse.rowCount > 0) {
      res.status(403).json({ msg: 'You have already voted on this poll' })
    } else {
      if (req.body.selection === 'custom') {
        const pollOptionResponse = await pgClient.query(
          `SELECT * FROM pollOption WHERE option=$1 AND "pollId"=$2;`,
          [req.body.customSelection, req.body.pollId]
        )

        if (pollOptionResponse.rowCount > 0) {
          res.status(403).json({ msg: 'Custom option already exists' })
        } else {
          const insertPollOptionPromise = pgClient.query(
            `INSERT INTO pollOption(option, votes, "pollId") VALUES ($1, 1, $2);`,
            [req.body.customSelection, req.body.pollId]
          )

          const insertIpPromise = pgClient.query(
            `INSERT INTO ip(ip, "pollId") VALUES ($1, $2);`,
            [req.clientIp, req.body.pollId]
          )

          await Promise.all([insertPollOptionPromise, insertIpPromise])

          const response = await pgClient.query(
            `SELECT * FROM poll p JOIN pollOption o ON p.id=o."pollId" WHERE p.id=$1;`,
            [req.body.pollId]
          )

          res.json({ msg: 'Vote Submitted', poll: response.rows })
        }
      } else {
        const updatePollVotePromise = pgClient.query(
          `UPDATE pollOption SET votes = votes + 1 WHERE option=$1 AND "pollId"=$2;`,
          [req.body.selection, req.body.pollId]
        )

        const insertIpPromise = pgClient.query(
          `INSERT INTO ip(ip, "pollId") VALUES ($1, $2);`,
          [req.clientIp, req.body.pollId]
        )

        await Promise.all([updatePollVotePromise, insertIpPromise])

        const response = await pgClient.query(
          `SELECT * FROM poll p JOIN pollOption o ON p.id=o."pollId" WHERE p.id=$1;`,
          [req.body.pollId]
        )

        res.json({ msg: 'Vote submitted', poll: response.rows })
      }
    }
  } catch (err) {
    next(err)
  }

  pgClient.release()
}

export const deletePoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pgClient = await pool.connect()
  await redisClient.connect()

  try {
    await redisClient.flushAll()

    await pgClient.query(`DELETE FROM poll WHERE id=$1`, [req.params.id])

    res.json({ msg: 'Poll deleted' })
  } catch (err) {
    next(err)
  }

  pgClient.release()
  await redisClient.quit()
}
