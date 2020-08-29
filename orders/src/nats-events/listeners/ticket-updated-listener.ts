import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@jsphbtst-tech/common'
import { Ticket } from 'models'
import { queueGroupName } from './queue-group-name'

class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated
	queueGroupName: string = queueGroupName

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		const { id, title, price, version } = data
		const ticket = await Ticket.findByEvent({ id, version })
		if (!ticket) {
			throw new Error('Ticket not found')
		}

		ticket.set({
			title,
			price
		})

		await ticket.save()
		msg.ack()
	}
}

export default TicketUpdatedListener
