import request from 'supertest'
import mongoose from 'mongoose'
import { app } from 'app'
import { Order, Ticket } from 'models'
import { OrderStatus } from '@jsphbtst-tech/common'
import { natsWrapper } from 'nats-wrapper'

describe('POST /api/orders TEST', () => {
	it('returns an error if ticket does not exist', async () => {
		const ticketId = mongoose.Types.ObjectId()

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId })
			.expect(404)
	})

	it('returns a ticket if the ticket is already reserved', async () => {
		const ticket = Ticket.build({
			title: 'Concert',
			price: 5,
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

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(400)
	})

	it('reserves a ticket', async () => {
		const ticket = Ticket.build({
			title: 'Concert',
			price: 5,
			id: mongoose.Types.ObjectId().toHexString()
		})
		await ticket.save()

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(201)
	})

	it('emits an order created event', async () => {
		const ticket = Ticket.build({
			title: 'Concert',
			price: 5,
			id: mongoose.Types.ObjectId().toHexString()
		})
		await ticket.save()

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(201)

		expect(natsWrapper.client.publish).toHaveBeenCalled()
	})
})
