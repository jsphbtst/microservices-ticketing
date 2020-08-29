import { Listener, OrderCreatedEvent, Subjects } from '@jsphbtst-tech/common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from 'queues'

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
		console.log(`Waiting ${delay} ms before publishing event`)

		await expirationQueue.add({ orderId: data.id }, { delay })
		msg.ack()
	}
}

export default OrderCreatedListener
