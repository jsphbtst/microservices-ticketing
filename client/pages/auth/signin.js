import { useState, useEffect, useCallback } from 'react'
import Router from 'next/router'
import axios from 'axios'
import useRequest from 'hooks/useRequest'

const Signin = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const { doRequest, errors } = useRequest({
		url: '/api/users/signin',
		method: 'post',
		body: { email, password },
		onSuccess: () => Router.push('/')
	})

	const handleEmail = event => {
		setEmail(event.target.value)
	}
	const handleEmailChange = useCallback(handleEmail, [])

	const handlePassword = event => {
		setPassword(event.target.value)
	}
	const handlePasswordChange = useCallback(handlePassword, [])

	const handleSubmit = async event => {
		event.preventDefault()
		doRequest()
	}

	return (
		<div className='container'>
			{errors}
			<form onSubmit={handleSubmit}>
				<h1>Sign in</h1>

				<div className='form-group'>
					<label>Email Address</label>
					<input
						required
						className='form-control'
						onChange={handleEmailChange}
					/>
				</div>

				<div className='form-group'>
					<label>Password</label>
					<input
						required
						className='form-control'
						type='password'
						onChange={handlePasswordChange}
					/>
				</div>

				<button className='btn btn-primary'>Sign in</button>
			</form>
		</div>
	)
}

export default Signin
