import express from 'express'

import { submitPoll, findPolls, findPoll, vote } from '../controllers/poll'
import { requireLogin } from '../middlewares/auth'

const poll = express.Router()

poll.post('/submit', requireLogin, submitPoll)

poll.get('/all', findPolls)

poll.get('/user/:id', requireLogin, findPolls)

poll.get('/info/:id', findPoll)

poll.put('/vote', vote)

export default poll
