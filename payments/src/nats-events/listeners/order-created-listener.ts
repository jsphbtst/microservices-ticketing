import { Listener, OrderCreatedEvent, Subjects } from '@jsphbtst-tech/common'
import { Message } from 'node-nats-streaming'
import { Order } from 'models'
import { queueGroupName } from './queue-group-name'

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const { id, status, userId, version, ticket } = data
		const { price } = ticket
		const order = Order.build({
			id,
			price,
			status,
			userId,
			version
		})
		await order.save()
		msg.ack()
	}
}

export default OrderCreatedListener
