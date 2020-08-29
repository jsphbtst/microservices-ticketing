import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@jsphbtst-tech/common'
import { queueGroupName } from './queue-group-name'
import TicketUpdatedPublisher from '../publishers/ticket-updated-publisher'
import { Ticket } from 'models'

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id)
		if (!ticket) {
			throw new Error('Ticket not found.')
		}

		ticket.set({ orderId: data.id })
		await ticket.save()

		// publish event
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version
		})

		msg.ack()
	}
}

export default OrderCreatedListener
