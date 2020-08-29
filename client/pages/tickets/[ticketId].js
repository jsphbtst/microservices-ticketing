import useRequest from 'hooks/useRequest'
import Router from 'next/router'

const TicketShow = ({ ticket }) => {
	const { doRequest, errors } = useRequest({
		url: '/api/orders',
		method: 'post',
		body: {
			ticketId: ticket.id
		},
		onSuccess: order => Router.push('/orders/[orderId]', `/orders/${order.id}`)
	})

	return (
		<div className='ticket-show'>
			<h1>Ticket Show</h1>
			<p>{ticket.title}</p>
			<p>{ticket.price}</p>
			{errors}
			<button className='btn btn-primary' onClick={() => doRequest()}>
				Purchase
			</button>
		</div>
	)
}

TicketShow.getInitialProps = async (context, client) => {
	const { ticketId } = context.query
	const { data } = await client.get(`/api/tickets/${ticketId}`)
	return { ticket: data }
}

export default TicketShow
