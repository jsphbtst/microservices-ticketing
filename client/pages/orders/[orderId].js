import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import Router from 'next/router'
import useRequest from 'hooks/useRequest'

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0)
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id
		},
		onSuccess: payment => Router.push('/orders')
	})

	useEffect(() => {
		const findTimeLeft = () => {
			const secondsLeft = (new Date(order.expiresAt) - new Date()) / 1000
			setTimeLeft(Math.round(secondsLeft))
		}

		findTimeLeft()
		const timerId = setInterval(findTimeLeft, 1000)
		return () => clearInterval(timerId)
	}, [order])

	if (timeLeft <= 0) {
		return (
			<div>
				<h1>Order</h1>
				<p>
					Order expired. <strong>FeelsBadMan</strong>.
				</p>
			</div>
		)
	}

	return (
		<div>
			<h1>Order</h1>
			<p>Time left to pay: {timeLeft} seconds</p>
			{errors}
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				amount={order.ticket.price * 100} // usd
				email={currentUser.email}
				stripeKey='pk_test_51HKHeuGh7ZX3OfHuv08HssZg6DLaktkpY4ULhctYl2yfV3qS6oGKqNplAH2SBFdWMZQgSzzo6Leq1jrAzDbhyRZg009jK2mNLz'
			/>
		</div>
	)
}

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query
	const { data } = await client.get(`/api/orders/${orderId}`)

	return { order: data }
}

export default OrderShow
