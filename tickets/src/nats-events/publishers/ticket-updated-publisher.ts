import { Publisher, Subjects, TicketUpdatedEvent } from '@jsphbtst-tech/common'

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}

export default TicketUpdatedPublisher