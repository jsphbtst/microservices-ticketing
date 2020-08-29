import express, { Request, Response } from 'express'
import {
	requiresAuth,
	NotFoundError,
	NotAuthorizedError
} from '@jsphbtst-tech/common'
import { Order } from 'models'

const router = express.Router()

router.get(
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

		res.send(order)
	}
)

export { router as showOrderRoute }
