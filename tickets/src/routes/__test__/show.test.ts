import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Ticket } from 'models'
/*
 * GET    /api/tickets                                        Retrieve all tickets
 * GET    /api/tickets/:id                                    Retrieve ticket with specific id
 * POST   /api/tickets      { title: string price: string }  Create a ticket
 * PUT    /api/tickets      { title: string price: string }  Update a ticket
 */

describe('/api/tickets/:id TEST', () => {
	it('returns a 404 if the ticket is not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString()

		// TODO: should be 400 I think
		await request(app)
			.get(`/api/tickets/5f35707088c9b93f7e8e4297`)
			.send()
			.expect(404)
	})

	it('returns the ticket if the ticket is found', async () => {
		const title = 'concert'
		const price = 20

		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin())
			.send({
				title,
				price
			})
			.expect(201)

		const ticketResponse = await request(app)
			.get(`/api/tickets/${response.body.id}`)
			.send()
			.expect(200)

		expect(ticketResponse.body.title).toEqual(title)
		expect(ticketResponse.body.price).toEqual(price)
	})
})
