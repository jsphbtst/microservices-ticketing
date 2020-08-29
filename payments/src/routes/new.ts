import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requiresAuth,
	validateRequest,
	BadRequestError,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus
} from '@jsphbtst-tech/common'
import { Order, Payment } from 'models'
import { stripe } from 'stripe-config'
import { PaymentCreatedPublisher } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const router = express.Router()

router.post(
	'/api/payments',
	requiresAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body
		const order = await Order.findById(orderId)
		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for cancelled order')
		}

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token
		})

		const payment = Payment.build({
			orderId,
			stripeId: charge.id
		})
		await payment.save()

		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: charge.id
		})

		res.status(201).send({ id: payment.id })
	}
)

export { router as createChargeRouter }
