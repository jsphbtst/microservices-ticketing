import request from 'supertest'
import { app } from '../../app'

describe('/api/users/signin TESTS', () => {
  it('fails when non-existent email supplied', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400)
  })

  it('fails when incorrect password supplied', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'passwor'
      })
      .expect(400)
  })

  it('succeeds on correct credentials', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(200)
  })  
})

