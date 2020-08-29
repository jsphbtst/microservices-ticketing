import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requiresAuth, validateRequest } from '@jsphbtst-tech/common'
import { Ticket } from 'models'

const router = express.Router()

router.get('/api/tickets', async (req: Request, res: Response) => {
	const tickets = await Ticket.find({
		orderId: undefined
	})
	res.status(200).send(tickets)
})

export { router as showAllTicketsRouter }
