import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@jsphbtst-tech/common'
import { natsWrapper } from 'nats-wrapper'
import { Ticket } from 'models'
import OrderCreatedListener from '../listeners/order-created-listener'
import { Message } from 'node-nats-streaming'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		title: 'Concert',
		price: 10,
		userId: 'asdf'
	})
	await ticket.save()

	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userId: 'asdf',
		expiresAt: 'asdf',
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

	return { listener, ticket, data, msg }
}

describe('order-created-listener.test.ts', () => {
	it('sets the userId of ticket', async () => {
		const { listener, ticket, data, msg } = await setup()
		await listener.onMessage(data, msg)
		const updatedTicket = await Ticket.findById(ticket.id)
		expect(updatedTicket!.orderId).toEqual(data.id)
	})

	it('acks the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(msg.ack).toHaveBeenCalled()
	})

	it('publishes ticket updated event', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(natsWrapper.client.publish).toHaveBeenCalled()

		const ticketUpdatedData = JSON.parse(
			(natsWrapper.client.publish as jest.Mock).mock.calls[2][1]
		)
		expect(data.id).toEqual(ticketUpdatedData.orderId)
	})
})
