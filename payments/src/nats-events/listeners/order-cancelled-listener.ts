import {
	Listener,
	OrderCancelledEvent,
	Subjects,
	OrderStatus
} from '@jsphbtst-tech/common'
import { Message } from 'node-nats-streaming'
import { Order } from 'models'
import { queueGroupName } from './queue-group-name'

class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
	queueGroupName = queueGroupName

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const { id, version } = data
		const order = await Order.findOne({
			_id: id,
			version: version - 1
		})
		if (!order) {
			throw new Error('Could not find order.')
		}

		order.set({ status: OrderStatus.Cancelled })
		await order.save()
		msg.ack()
	}
}

export default OrderCancelledListener
