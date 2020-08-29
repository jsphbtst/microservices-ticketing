import express, { Request, Response } from 'express'
import {
	requiresAuth,
	OrderStatus,
	NotFoundError,
	NotAuthorizedError
} from '@jsphbtst-tech/common'
import { Order, Ticket } from 'models'
import { OrderCancelledPublisher } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const router = express.Router()

router.delete(
	'/api/orders/:orderId',
	requiresAuth,
	async (req: Request, res: Response) => {
		const order = await Order.findById(req.params.orderId).populate('ticket')
		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		order.status = OrderStatus.Cancelled
		await order.save()

		new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
				price: order.ticket.price
			}
		})

		res.status(204).send(order)
	}
)

export { router as deleteOrderRoute }
