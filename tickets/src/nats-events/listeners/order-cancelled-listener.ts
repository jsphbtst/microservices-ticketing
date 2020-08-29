import { Listener, OrderCancelledEvent, Subjects } from '@jsphbtst-tech/common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Ticket } from 'models'
import TicketUpdatedPublisher from '../publishers/ticket-updated-publisher'

class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
	queueGroupName = queueGroupName

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id)

		if (!ticket) {
			throw new Error('Ticket not found.')
		}

		ticket.set({ orderId: undefined })
		ticket.save()

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId
		})

		msg.ack()
	}
}

export default OrderCancelledListener
