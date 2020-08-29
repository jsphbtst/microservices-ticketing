import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'

declare global {
	namespace NodeJS {
		interface Global {
			signin(id?: string): string[]
		}
	}
}

jest.mock('nats-wrapper')

let mongo: any
beforeAll(async () => {
	process.env.JWT_KEY = 'asdf'
	jest.clearAllMocks()
	mongo = new MongoMemoryServer()
	const mongoUri = await mongo.getUri()
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
})

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections()

	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	await mongo.stop()
	await mongoose.connection.close()
})

global.signin = (id?: string) => {
	// Build a JWT payload { id, email }
	const payload = {
		id: id || new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com'
	}

	// Create a JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!)

	// Build a session object
	const session = { jwt: token }

	// turn session into JSON
	const sessionJSON = JSON.stringify(session)

	// take json and base64 encode
	const base64 = Buffer.from(sessionJSON).toString('base64')

	// return string that's the cookie with the encoded data
	return [`express:sess=${base64}`]
}
