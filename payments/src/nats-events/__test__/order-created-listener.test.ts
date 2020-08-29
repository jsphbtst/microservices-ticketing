import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@jsphbtst-tech/common'
import { natsWrapper } from 'nats-wrapper'
import OrderCreatedListener from '../listeners/order-created-listener'
import { Order } from 'models'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: 'asdf',
		userId: 'asdf',
		status: OrderStatus.Created,
		ticket: {
			id: 'asdf',
			price: 10
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg }
}

describe('order-created-listener.test.ts', () => {
	it('replicated order info', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)

		const order = await Order.findById(data.id)
		expect(order!.price).toEqual(data.ticket.price)
	})

	it('acks the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(msg.ack).toHaveBeenCalled()
	})
})
