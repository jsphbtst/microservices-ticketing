import request from 'supertest'
import { app } from '../../app'
import { Ticket } from 'models'

/*
 * GET    /api/tickets                                        Retrieve all tickets
 * GET    /api/tickets/:id                                    Retrieve ticket with specific id
 * POST   /api/tickets      { title: string price: string }  Create a ticket
 * PUT    /api/tickets      { title: string price: string }  Update a ticket
 */

describe('/api/tickets/ GET ALL', () => {
  it('can fetch a list of tickets', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'asdf',
        price: 20
      })

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'asdf',
        price: 20
      })

    const response = await request(app)
      .get('/api/tickets')
      .send()
      .expect(200)

    expect(response.body.length).toEqual(2)
  })
})