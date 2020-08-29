import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requiresAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	BadRequestError
} from '@jsphbtst-tech/common'
import { Ticket } from 'models'
import { TicketUpdatedPublisher } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const router = express.Router()

router.put(
	'/api/tickets/:id',
	requiresAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and must be greater than 0')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id)

		if (!ticket) {
			throw new NotFoundError()
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket.')
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		ticket.set({ title: req.body.title, price: req.body.price })
		await ticket.save()
		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		})

		res.status(200).send(ticket)
	}
)

export { router as updateTicketsRouter }
