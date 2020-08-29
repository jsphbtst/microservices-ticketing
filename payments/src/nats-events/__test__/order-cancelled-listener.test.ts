import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent, OrderStatus } from '@jsphbtst-tech/common'
import { natsWrapper } from 'nats-wrapper'
import OrderCancelledListener from '../listeners/order-cancelled-listener'
import { Order } from 'models'

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client)

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		price: 10,
		userId: 'asdf',
		version: 0
	})
	await order.save()

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: 'asdf',
			price: 10
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg, order }
}

describe('order-cancelled-listener.test.ts', () => {
	it('updates status of order', async () => {
		const { listener, data, msg, order } = await setup()
		await listener.onMessage(data, msg)

		const updatedOrder = await Order.findById(data.id)
		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
	})

	it('acks the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(msg.ack).toHaveBeenCalled()
	})
})
