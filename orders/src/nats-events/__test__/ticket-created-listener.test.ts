import mongoose from 'mongoose'
import { TicketCreatedEvent } from '@jsphbtst-tech/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from 'models'
import { TicketCreatedListener } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

const setup = async () => {
	const listener = new TicketCreatedListener(natsWrapper.client)
	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert 1',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString()
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg }
}

describe('ticket-created-listener test', () => {
	it('create and save ticket', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)

		const ticket = await Ticket.findById(data.id)
		expect(ticket).toBeDefined()
		expect(ticket!.title).toEqual(data.title)
		expect(ticket!.price).toEqual(data.price)
	})

	it('acks the message', async () => {
		const { listener, data, msg } = await setup()
		await listener.onMessage(data, msg)

		expect(msg.ack).toHaveBeenCalled()
	})
})
