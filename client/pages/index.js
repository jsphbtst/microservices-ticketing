import Head from 'next/head'
import Link from 'next/link'

const Index = ({ currentUser, tickets }) => {
	const ticketList = tickets.map((ticket, index) => {
		return (
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
				<td>
					<Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
						<a>View</a>
					</Link>
				</td>
			</tr>
		)
	})
	return (
		<div className='container'>
			<Head>
				<title>K8s Cluster Next App</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			{currentUser ? (
				<h2>You are signed in, {currentUser.email}</h2>
			) : (
				<h2>You are not signed in</h2>
			)}

			<hr />

			<h2>Tickets</h2>
			<table className='table'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
						<th>Link</th>
					</tr>
				</thead>

				<tbody>{ticketList}</tbody>
			</table>
		</div>
	)
}

Index.getInitialProps = async (context, client, currentUser) => {
	const { data } = await client.get('/api/tickets')
	return { tickets: data }
}

export default Index
