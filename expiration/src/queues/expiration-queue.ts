import Queue from 'bull'
import { ExpirationCompletePublisher } from 'nats-events'
import { natsWrapper } from 'nats-wrapper'

interface Payload {
	orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST
	}
})

expirationQueue.process(async job => {
	const { orderId } = job.data
	new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId })
})

export default expirationQueue
