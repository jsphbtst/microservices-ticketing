import { Subjects, Publisher, PaymentCreatedEvent } from '@jsphbtst-tech/common'

class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}

export default PaymentCreatedPublisher
