import {
	Subjects,
	Publisher,
	ExpirationCompleteEvent
} from '@jsphbtst-tech/common'

class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}

export default ExpirationCompletePublisher
