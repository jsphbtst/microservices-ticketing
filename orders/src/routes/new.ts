import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
	requiresAuth,
	validateRequest,
	OrderStatus,
	NotFoundError,
	BadRequestError
} from '@jsphbtst-tech/common'
import { body } from 'express-validator'
import { Ticket, Order } from 'models'
import { OrderCreatedPublisher } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60

router.post(
	'/api/orders',
	requiresAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided.')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body
		const ticket = await Ticket.findById(ticketId)
		if (!ticket) {
			throw new NotFoundError()
		}

		const isReserved = await ticket.isReserved()
		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved')
		}

		const expiration = new Date()
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

		const order = Order.build({
			ticket,
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration
		})
		await order.save()

		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			version: order.version,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price
			}
		})

		res.status(201).send(order)
	}
)

export { router as newOrderRoute }
