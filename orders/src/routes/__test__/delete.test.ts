import mongoose from 'mongoose'
import request from 'supertest'
import { app } from 'app'
import { Order, Ticket } from 'models'
import { OrderStatus } from '@jsphbtst-tech/common'
import { natsWrapper } from 'nats-wrapper'

describe('DELETE /api/orders', () => {
	it('marks an order as cancelled', async () => {
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
			.delete(`/api/orders/${order.id}`)
			.set('Cookie', user)
			.send()
			.expect(204)

		const updatedOrder = await Order.findById(order.id)
		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
	})

	it('emits an order:cancelled event to event bus', async () => {
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
			.delete(`/api/orders/${order.id}`)
			.set('Cookie', user)
			.send()
			.expect(204)

		expect(natsWrapper.client.publish).toHaveBeenCalled()
	})
})
