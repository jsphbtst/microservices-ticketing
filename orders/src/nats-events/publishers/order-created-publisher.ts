import { Publisher, OrderCreatedEvent, Subjects } from '@jsphbtst-tech/common'

class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
}

export default OrderCreatedPublisher
