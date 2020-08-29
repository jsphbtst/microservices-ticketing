import request from 'supertest'
import mongoose from 'mongoose'
import { app } from 'app'
import { Ticket } from 'models'
import { natsWrapper } from 'nats-wrapper'

/*
 * GET    /api/tickets                                        Retrieve all tickets
 * GET    /api/tickets/:id                                    Retrieve ticket with specific id
 * POST   /api/tickets      { title: string price: string }  Create a ticket
 * PUT    /api/tickets      { title: string price: string }  Update a ticket
 */

describe('/api/tickets/ PUT UPDATE', () => {
	it('returns a 404 if the provided id does not exist', async () => {
		const id = new mongoose.Types.ObjectId().toHexString()
		await request(app)
			.put(`/api/tickets/${id}`)
			.set('Cookie', global.signin())
			.send({
				title: 'asdf',
				price: 10
			})
			.expect(404)
	})

	it('returns a 401 if the user is not authenticated', async () => {
		const id = new mongoose.Types.ObjectId().toHexString()
		await request(app)
			.put(`/api/tickets/${id}`)
			.set('Cookie', global.signin())
			.send({
				title: 'asdf',
				price: 10
			})
			.expect(404)
	})

	it('returns a 401 if the user does not own a ticket', async () => {
		const response = await request(app)
			.post(`/api/tickets`)
			.set('Cookie', global.signin())
			.send({
				title: 'asdf',
				price: 10
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', global.signin())
			.send({
				title: 'asdfasdf',
				price: 1010
			})
			.expect(401)
	})

	it('returns a 400 if the user provides an invalid title or price', async () => {
		const cookie = global.signin()

		const response = await request(app)
			.post(`/api/tickets`)
			.set('Cookie', cookie)
			.send({
				title: 'asdf',
				price: 10
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({
				title: '',
				price: 10
			})
			.expect(400)

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({
				title: 'asdf',
				price: -10
			})
			.expect(400)
	})

	it('updates the ticket provided valid inputs', async () => {
		const cookie = global.signin()

		const response = await request(app)
			.post(`/api/tickets`)
			.set('Cookie', cookie)
			.send({
				title: 'asdf',
				price: 10
			})

		const title = 'new title'
		const price = 100
		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({ title, price })
			.expect(200)

		const ticketResponse = await request(app).get(
			`/api/tickets/${response.body.id}`
		)

		expect(ticketResponse.body.title).toEqual(title)
		expect(ticketResponse.body.price).toEqual(price)
	})

	it('publishes an event', async () => {
		const cookie = global.signin()

		const response = await request(app)
			.post(`/api/tickets`)
			.set('Cookie', cookie)
			.send({
				title: 'asdf',
				price: 10
			})

		const title = 'new title'
		const price = 100
		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({ title, price })
			.expect(200)

		expect(natsWrapper.client.publish).toHaveBeenCalled()
	})

	it('rejects updates if ticket reserved', async () => {
		const cookie = global.signin()

		const response = await request(app)
			.post(`/api/tickets`)
			.set('Cookie', cookie)
			.send({
				title: 'asdf',
				price: 10
			})

		const ticket = await Ticket.findById(response.body.id)
		ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
		await ticket!.save()

		const title = 'new title'
		const price = 100
		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({ title, price })
			.expect(400)
	})
})
