import mongoose from 'mongoose'
import { OrderCancelledEvent } from '@jsphbtst-tech/common'
import OrderCancelledListener from '../listeners/order-cancelled-listener'
import { Ticket } from 'models'
import { natsWrapper } from 'nats-wrapper'
import { Message } from 'node-nats-streaming'

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client)

	const ticket = Ticket.build({
		title: 'Concert',
		price: 50,
		userId: 'asdf'
	})
	const orderId = mongoose.Types.ObjectId().toHexString()
	ticket.set({ orderId })
	await ticket.save()

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
			price: ticket.price
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, orderId, data, msg }
}

describe('order-cancelled-listener.test.ts', () => {
	// got lazy brr
	it('updates ticket, publishes event, and acks message', async () => {
		const { listener, ticket, data, msg } = await setup()
		await listener.onMessage(data, msg)

		const updatedTicket = await Ticket.findById(ticket.id)
		expect(updatedTicket!.orderId).toBeDefined()
		expect(msg.ack).toHaveBeenCalled()
		expect(natsWrapper.client.publish).toHaveBeenCalled()
	})
})
