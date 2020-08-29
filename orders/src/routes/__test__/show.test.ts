import request from 'supertest'
import mongoose from 'mongoose'
import { app } from 'app'
import { Order, Ticket } from 'models'
import { OrderStatus } from '@jsphbtst-tech/common'

describe('GET /api/orders/:orderId TEST', () => {
	it('fetches an order', async () => {
		const ticket = Ticket.build({
			title: 'Concert',
			price: 5,
			id: mongoose.Types.ObjectId().toHexString()
		})
		await ticket.save()

		const user = global.signin()
		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201)

		const { body: fetchedOrder } = await request(app)
			.get(`/api/orders/${order.id}`)
			.set('Cookie', user)
			.send()
		expect(200)

		expect(fetchedOrder.id).toEqual(order.id)
	})

	it('error if user one tries to get user two order', async () => {
		const ticket = Ticket.build({
			title: 'Concert',
			price: 5,
			id: mongoose.Types.ObjectId().toHexString()
		})
		await ticket.save()

		const user = global.signin()
		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201)

		await request(app)
			.get(`/api/orders/${order.id}`)
			.set('Cookie', global.signin())
			.send()
		expect(401)
	})
})
