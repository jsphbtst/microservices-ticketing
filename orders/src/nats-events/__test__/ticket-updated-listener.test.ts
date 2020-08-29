import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@jsphbtst-tech/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from 'models'
import { TicketUpdatedListener } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const setup = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert 1',
		price: 10
	})
	await ticket.save()

	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: 'Concert 1 v1',
		price: 20,
		userId: 'asdf'
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg, ticket }
}

describe('ticket-updated-listener test', () => {
	it('finds, updates, and saves a ticket', async () => {
		const { ticket, listener, data, msg } = await setup()
		await listener.onMessage(data, msg)

		const updatedTicket = await Ticket.findById(ticket.id)
		expect(updatedTicket!.title).toEqual(data.title)
		expect(updatedTicket!.price).toEqual(data.price)
		expect(updatedTicket!.version).toEqual(data.version)
	})

	it('acks the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)
		expect(msg.ack).toHaveBeenCalled()
	})

	it('does not ack if event is out of order', async () => {
		const { ticket, listener, data, msg } = await setup()
		data.version = 69

		try {
			await listener.onMessage(data, msg)
		} catch (error) {}

		expect(msg.ack).not.toHaveBeenCalled()
	})
})
