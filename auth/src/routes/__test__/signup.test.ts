import request from 'supertest'
import { app } from '../../app'

describe('/api/users/signup TESTS', () => {
  it('returns 201 on successful signup', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)
  })

  it('returns 400 with missing email or password', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test',
        password: 'password'
      })
      .expect(400)

    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'pa'
      })
      .expect(400)
  })

  it('disallows duplicate emails', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400)      
  })


  it('sets a cookie after successful signup', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    expect(response.get('Set-Cookie')).toBeDefined()
  })
})

