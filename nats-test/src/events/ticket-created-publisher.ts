import { Publisher, Subjects, TicketCreatedEvent } from '@jsphbtst-tech/common'

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}


export default TicketCreatedPublisher