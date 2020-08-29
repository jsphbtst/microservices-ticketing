import mongoose from 'mongoose'
import { OrderStatus, ExpirationCompleteEvent } from '@jsphbtst-tech/common'
import { Message } from 'node-nats-streaming'
import { natsWrapper } from 'nats-wrapper'
import { ExpirationCompleteListener } from 'nats-events'
import { Order, Ticket } from 'models'

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client)

	const ticket = Ticket.build({
		title: 'Concert',
		price: 10,
		id: mongoose.Types.ObjectId().toHexString()
	})
	await ticket.save()

	const order = Order.build({
		ticket,
		userId: 'asdf',
		status: OrderStatus.Created,
		expiresAt: new Date()
	})
	await order.save()

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, order, data, msg }
}

describe('ticket-created-listener test', () => {
	it('updates order status to cancelled', async () => {
		const { listener, data, msg, order } = await setup()
		await listener.onMessage(data, msg)

		const updatedOrder = await Order.findById(order.id)
		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
	})

	it('emit and OrderCancelled event', async () => {
		const { listener, data, msg, order } = await setup()
		await listener.onMessage(data, msg)

		expect(natsWrapper.client.publish).toHaveBeenCalled()

		const eventData = JSON.parse(
			(natsWrapper.client.publish as jest.Mock).mock.calls[1][1]
		)
		expect(eventData.id).toEqual(order.id)
	})

	it('ack the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(msg.ack).toHaveBeenCalled()
	})
})
