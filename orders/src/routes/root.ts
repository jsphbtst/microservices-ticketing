import express, { Request, Response } from 'express'
import { requiresAuth } from '@jsphbtst-tech/common'
import { Ticket, Order } from 'models'

const router = express.Router()

router.get('/api/orders', requiresAuth, async (req: Request, res: Response) => {
	const orders = await Order.find({
		userId: req.currentUser!.id
	}).populate('ticket')

	res.status(200).send(orders)
})

export { router as showAllOrdersRoute }
