import { Publisher, OrderCancelledEvent, Subjects } from '@jsphbtst-tech/common'

class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}

export default OrderCancelledPublisher
